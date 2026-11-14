import { obtenerUsuarioSesion } from './sesiones'
import {
  generarSecretoTOTP,
  crearEnlaceTOTP,
  cifrarSecretoTOTP,
  descifrarSecretoTOTP,
  obtenerPasoTOTP,
} from './totp'

interface ActivacionEnv {
  estadliga_db: D1Database
  TOTP_ENCRYPTION_KEY: string
}

interface Configuracion2FA {
  secreto_cifrado: string
  activado: number
}

function json(datos: unknown, status = 200): Response {
  return new Response(JSON.stringify(datos), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function preparar2FA(
  request: Request,
  env: ActivacionEnv,
): Promise<Response> {
  const usuario = await obtenerUsuarioSesion(request, env)

  if (!usuario) {
    return json({ error: 'Debes iniciar sesión' }, 401)
  }

  const configuracion = await env.estadliga_db
    .prepare(`
      SELECT activado
      FROM usuarios_2fa
      WHERE usuario_id = ?
    `)
    .bind(usuario.id)
    .first<{ activado: number }>()

  if (configuracion?.activado === 1) {
    return json({ error: 'El 2FA ya está activado' }, 409)
  }

  const secreto = generarSecretoTOTP()
  const secretoCifrado = await cifrarSecretoTOTP(
    secreto,
    env.TOTP_ENCRYPTION_KEY,
  )

  await env.estadliga_db
    .prepare(`
      INSERT INTO usuarios_2fa (
        usuario_id,
        secreto_cifrado,
        activado
      )
      VALUES (?, ?, 0)
      ON CONFLICT(usuario_id) DO UPDATE SET
        secreto_cifrado = excluded.secreto_cifrado,
        ultimo_paso_totp = -1
      WHERE usuarios_2fa.activado = 0
    `)
    .bind(usuario.id, secretoCifrado)
    .run()

  return json({
    mensaje: 'Escanea el código con Google Authenticator',
    secreto,
    enlace: crearEnlaceTOTP(secreto, usuario.email),
  })
}

export async function activar2FA(
  request: Request,
  env: ActivacionEnv,
): Promise<Response> {
  const usuario = await obtenerUsuarioSesion(request, env)

  if (!usuario) {
    return json({ error: 'Debes iniciar sesión' }, 401)
  }

  let datos: unknown

  try {
    datos = await request.json()
  } catch {
    return json({ error: 'Solicitud no válida' }, 400)
  }

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return json({ error: 'Solicitud no válida' }, 400)
  }

  const codigo = (datos as Record<string, unknown>).codigo

  if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
    return json({ error: 'Introduce un código de seis dígitos' }, 400)
  }

  const configuracion = await env.estadliga_db
    .prepare(`
      SELECT secreto_cifrado, activado
      FROM usuarios_2fa
      WHERE usuario_id = ?
    `)
    .bind(usuario.id)
    .first<Configuracion2FA>()

  if (!configuracion || configuracion.activado === 1) {
    return json({ error: 'No hay una activación pendiente' }, 409)
  }

  const secreto = await descifrarSecretoTOTP(
    configuracion.secreto_cifrado,
    env.TOTP_ENCRYPTION_KEY,
  )

  const paso = await obtenerPasoTOTP(secreto, codigo)

  if (paso === null) {
    return json({ error: 'Código incorrecto' }, 401)
  }

  const resultado = await env.estadliga_db
    .prepare(`
      UPDATE usuarios_2fa
      SET
        activado = 1,
        activado_en = CURRENT_TIMESTAMP,
        ultimo_paso_totp = ?
      WHERE usuario_id = ?
        AND activado = 0
        AND secreto_cifrado = ?
    `)
    .bind(paso, usuario.id, configuracion.secreto_cifrado)
    .run()

  if (resultado.meta.changes !== 1) {
    return json({ error: 'No se ha podido activar el 2FA' }, 409)
  }

  return json({
    mensaje: 'Google Authenticator activado correctamente',
    activado: true,
  })
}

export async function estado2FA(
  request: Request,
  env: ActivacionEnv,
): Promise<Response> {
  const usuario = await obtenerUsuarioSesion(request, env)

  if (!usuario) {
    return json({ error: 'Debes iniciar sesión' }, 401)
  }

  const configuracion = await env.estadliga_db
    .prepare(`
      SELECT activado
      FROM usuarios_2fa
      WHERE usuario_id = ?
    `)
    .bind(usuario.id)
    .first<{ activado: number }>()

  return json({
    activado: configuracion?.activado === 1,
  })
}
