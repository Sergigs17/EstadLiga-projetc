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

export async function crearSesion(
  env: BaseDatosAuth,
  usuarioId: number,
): Promise<string> {
  const token = crearTokenSeguro()
  const tokenHash = await hashToken(token)

  const expiracion = new Date(
    Date.now() + DURACION_SESION_SEGUNDOS * 1000,
  ).toISOString()

  await env.estadliga_db
    .prepare(`
      INSERT INTO sesiones_usuarios
        (usuario_id, token_hash, expira_en)
      VALUES (?, ?, ?)
    `)
    .bind(usuarioId, tokenHash, expiracion)
    .run()

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
