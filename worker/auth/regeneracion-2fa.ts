
import {
  prepararCodigosRecuperacion,
  consultasGuardarCodigosRecuperacion,
} from './recuperacion-2fa'
import { consumirIntento } from './rate-limit'
import { obtenerUsuarioSesion } from './sesiones'
import {
  descifrarSecretoTOTP,
  obtenerPasoTOTP,
} from './totp'

interface RegeneracionEnv {
  estadliga_db: D1Database
  TOTP_ENCRYPTION_KEY: string
}

interface Configuracion2FA {
  secreto_cifrado: string
  activado: number
  ultimo_paso_totp: number | null
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

export async function regenerarCodigosRecuperacion(
  request: Request,
  env: RegeneracionEnv,
): Promise<Response> {
  const usuario = await obtenerUsuarioSesion(request, env)

  if (!usuario) {
    return json({ error: 'Debes iniciar sesión' }, 401)
  }

  const limiteIP = await consumirIntento(
    request,
    env,
    '2fa_regenerar',
  )

  const limiteCuenta = await consumirIntento(
    request,
    env,
    '2fa_regenerar',
    String(usuario.id),
  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {
    return json({
      error: 'Demasiados intentos. Inténtalo más tarde.',
    }, 429)
  }

  const tipo = request.headers.get('Content-Type') ?? ''

  if (!tipo.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Solicitud no válida' }, 400)
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
    return json({
      error: 'Introduce un código de seis dígitos',
    }, 400)
  }

  const configuracion = await env.estadliga_db
    .prepare(`
      SELECT
        secreto_cifrado,
        activado,
        ultimo_paso_totp
      FROM usuarios_2fa
      WHERE usuario_id = ?
    `)
    .bind(usuario.id)
    .first<Configuracion2FA>()

  if (!configuracion || configuracion.activado !== 1) {
    return json({
      error: 'Google Authenticator no está activado',
    }, 409)
  }

  const secreto = await descifrarSecretoTOTP(
    configuracion.secreto_cifrado,
    env.TOTP_ENCRYPTION_KEY,
  )

  const paso = await obtenerPasoTOTP(secreto, codigo)

  if (
  paso === null ||
  paso <= (configuracion.ultimo_paso_totp ?? -1)
) {
  return json({
    error: 'Código incorrecto o ya utilizado. Espera al siguiente código.',
  }, 401)
}

  const { codigos, hashes } = await prepararCodigosRecuperacion()

  const operaciones = [
    env.estadliga_db
      .prepare(`
        UPDATE usuarios_2fa
        SET ultimo_paso_totp = ?
        WHERE usuario_id = ?
          AND activado = 1
          AND secreto_cifrado = ?
          AND ultimo_paso_totp < ?
      `)
      .bind(
        paso,
        usuario.id,
        configuracion.secreto_cifrado,
        paso,
      ),

    env.estadliga_db.prepare(`
      SELECT CASE
        WHEN changes() = 1 THEN 1
        ELSE json_extract('invalid-json', '$')
      END AS comprobacion
    `),

    ...consultasGuardarCodigosRecuperacion(
      env,
      usuario.id,
      hashes,
    ),
  ]

  try {
    await env.estadliga_db.batch(operaciones)
  } catch {
    return json({
      error: 'Código ya utilizado o no se han podido regenerar los códigos',
    }, 409)
  }

  return json({
    mensaje: 'Códigos de recuperación regenerados correctamente',
    codigos_recuperacion: codigos,
    aviso: 'Los códigos anteriores ya no son válidos. Guarda los nuevos en un lugar seguro.',
  })
}
