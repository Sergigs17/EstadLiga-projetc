
const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 7
const NOMBRE_COOKIE = 'estadliga_sesion'

export interface UsuarioSesion {
  id: number
  nombre: string
  email: string
  rol: 'usuario' | 'admin'
  email_verificado: boolean
}

interface SesionBD extends Omit<UsuarioSesion, 'email_verificado'> {
  sesion_id: number
  email_verificado: number
}

interface BaseDatosAuth {
  estadliga_db: D1Database
}

function bytesAHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hashToken(token: string): Promise<string> {
  const datos = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', datos)

  return bytesAHex(new Uint8Array(hash))
}

function crearTokenSeguro(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return bytesAHex(bytes)
}

function obtenerCookie(request: Request, nombre: string): string | null {
  const cabecera = request.headers.get('Cookie')

  if (!cabecera) return null

  for (const fragmento of cabecera.split(';')) {
    const separador = fragmento.indexOf('=')

    if (separador === -1) continue

    const clave = fragmento.slice(0, separador).trim()
    const valor = fragmento.slice(separador + 1).trim()

    if (clave === nombre) {
      return valor
    }
  }

  return null
}

function atributosCookie(request: Request): string {
  const url = new URL(request.url)

  const segura =
    url.protocol === 'https:' ? '; Secure' : ''

  return `Path=/; HttpOnly; SameSite=Lax${segura}`
}

/**
 * Crea una sesión únicamente si el usuario no tiene
 * Google Authenticator activado.
 *
 * La comprobación y la inserción se ejecutan en una
 * misma sentencia SQL para evitar condiciones de carrera.
 *
 * Devuelve null si el 2FA está activado.
 */
export async function crearSesionSin2FA(
  env: BaseDatosAuth,
  usuarioId: number,
): Promise<string | null> {
  const token = crearTokenSeguro()
  const tokenHash = await hashToken(token)

  const expiracion = new Date(
    Date.now() + DURACION_SESION_SEGUNDOS * 1000,
  ).toISOString()

  const resultado = await env.estadliga_db
    .prepare(`
      INSERT INTO sesiones_usuarios
        (usuario_id, token_hash, expira_en)
      SELECT
        u.id, ?, ?
      FROM usuarios u
      WHERE u.id = ?
        AND NOT EXISTS (
          SELECT 1
          FROM usuarios_2fa f
          WHERE f.usuario_id = u.id
            AND f.activado = 1
        )
    `)
    .bind(tokenHash, expiracion, usuarioId)
    .run()

  if (resultado.meta.changes !== 1) {
    return null
  }

  return token
}

export function cookieIniciarSesion(
  request: Request,
  token: string,
): string {
  return (
    `${NOMBRE_COOKIE}=${token}; ` +
    `Max-Age=${DURACION_SESION_SEGUNDOS}; ` +
    atributosCookie(request)
  )
}

export function cookieCerrarSesion(request: Request): string {
  return (
    `${NOMBRE_COOKIE}=; ` +
    `Max-Age=0; ` +
    atributosCookie(request)
  )
}

export async function obtenerUsuarioSesion(
  request: Request,
  env: BaseDatosAuth,
): Promise<UsuarioSesion | null> {
  const token = obtenerCookie(request, NOMBRE_COOKIE)

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return null
  }

  const tokenHash = await hashToken(token)

  const sesion = await env.estadliga_db
    .prepare(`
      SELECT
        s.id AS sesion_id,
        u.id,
        u.nombre,
        u.email,
        u.rol,
        u.email_verificado
      FROM sesiones_usuarios s
      INNER JOIN usuarios u
        ON u.id = s.usuario_id
      WHERE s.token_hash = ?
        AND s.revocado_en IS NULL
        AND s.expira_en > ?
      LIMIT 1
    `)
    .bind(tokenHash, new Date().toISOString())
    .first<SesionBD>()

  if (!sesion) return null

  return {
    id: sesion.id,
    nombre: sesion.nombre,
    email: sesion.email,
    rol: sesion.rol,
    email_verificado: sesion.email_verificado === 1,
  }
}

export async function revocarSesion(
  request: Request,
  env: BaseDatosAuth,
): Promise<void> {
  const token = obtenerCookie(request, NOMBRE_COOKIE)

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return
  }

  const tokenHash = await hashToken(token)

  await env.estadliga_db
    .prepare(`
      UPDATE sesiones_usuarios
      SET revocado_en = CURRENT_TIMESTAMP
      WHERE token_hash = ?
        AND revocado_en IS NULL
    `)
    .bind(tokenHash)
    .run()
}

/**
 * Revoca todas las sesiones de un usuario excepto la sesión actual.
 * Se utiliza después de cambios importantes de seguridad.
 */
export async function revocarOtrasSesiones(
  request: Request,
  env: BaseDatosAuth,
  usuarioId: number,
): Promise<number> {
  const token = obtenerCookie(request, NOMBRE_COOKIE)

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    throw new Error('No se ha encontrado una sesión válida')
  }

  const tokenHash = await hashToken(token)

  const resultado = await env.estadliga_db
    .prepare(`
      UPDATE sesiones_usuarios
      SET revocado_en = CURRENT_TIMESTAMP
      WHERE usuario_id = ?
        AND token_hash <> ?
        AND revocado_en IS NULL
        AND expira_en > ?
        AND EXISTS (
          SELECT 1
          FROM sesiones_usuarios actual
          WHERE actual.usuario_id = ?
            AND actual.token_hash = ?
            AND actual.revocado_en IS NULL
            AND actual.expira_en > ?
        )
    `)
    .bind(
      usuarioId,
      tokenHash,
      new Date().toISOString(),
      usuarioId,
      tokenHash,
      new Date().toISOString(),
    )
    .run()

  return resultado.meta.changes ?? 0
}

/**
 * Prepara una consulta D1 para revocar las demás sesiones
 * dentro de una operación batch.
 */
export async function consultaRevocarOtrasSesiones(
  request: Request,
  env: BaseDatosAuth,
  usuarioId: number,
): Promise<D1PreparedStatement> {
  const token = obtenerCookie(request, NOMBRE_COOKIE)

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    throw new Error('No se ha encontrado una sesión válida')
  }

  const tokenHash = await hashToken(token)
  const ahora = new Date().toISOString()

  return env.estadliga_db
    .prepare(`
      UPDATE sesiones_usuarios
      SET revocado_en = CURRENT_TIMESTAMP
      WHERE usuario_id = ?
        AND token_hash <> ?
        AND revocado_en IS NULL
        AND expira_en > ?
        AND EXISTS (
          SELECT 1
          FROM sesiones_usuarios actual
          WHERE actual.usuario_id = ?
            AND actual.token_hash = ?
            AND actual.revocado_en IS NULL
            AND actual.expira_en > ?
        )
    `)
    .bind(
      usuarioId,
      tokenHash,
      ahora,
      usuarioId,
      tokenHash,
      ahora,
    )
}

/**
 * Prepara una comprobación que hace fallar el lote D1
 * si la sesión actual no sigue siendo válida.
 */
export async function consultaComprobarSesionActual(
  request: Request,
  env: BaseDatosAuth,
  usuarioId: number,
): Promise<D1PreparedStatement> {
  const token = obtenerCookie(request, NOMBRE_COOKIE)

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    throw new Error('No se ha encontrado una sesión válida')
  }

  const tokenHash = await hashToken(token)
  const ahora = new Date().toISOString()

  return env.estadliga_db
    .prepare(`
      SELECT CASE
        WHEN EXISTS (
          SELECT 1
          FROM sesiones_usuarios
          WHERE usuario_id = ?
            AND token_hash = ?
            AND revocado_en IS NULL
            AND expira_en > ?
        )
        THEN 1
        ELSE json_extract('invalid-json', '$')
      END AS comprobacion
    `)
    .bind(usuarioId, tokenHash, ahora)
}

/**
 * Prepara una sesión para insertarla dentro de una
 * transacción D1 después de verificar el segundo factor.
 *
 * Comprueba que el 2FA siga activado y que el secreto
 * sea exactamente el mismo que se acaba de verificar.
 *
 * El token solo debe entregarse al navegador cuando
 * la transacción haya terminado correctamente.
 */
export async function prepararSesion2FA(
  env: BaseDatosAuth,
  usuarioId: number,
  secretoCifrado: string,
): Promise<{
  token: string
  consulta: D1PreparedStatement
}> {
  const token = crearTokenSeguro()
  const tokenHash = await hashToken(token)

  const expiracion = new Date(
    Date.now() + DURACION_SESION_SEGUNDOS * 1000,
  ).toISOString()

  const consulta = env.estadliga_db
    .prepare(`
      INSERT INTO sesiones_usuarios
        (usuario_id, token_hash, expira_en)
      SELECT
        u.id, ?, ?
      FROM usuarios u
      WHERE u.id = ?
        AND EXISTS (
          SELECT 1
          FROM usuarios_2fa f
          WHERE f.usuario_id = u.id
            AND f.activado = 1
            AND f.secreto_cifrado = ?
        )
    `)
    .bind(
      tokenHash,
      expiracion,
      usuarioId,
      secretoCifrado,
    )

  return { token, consulta }
}
