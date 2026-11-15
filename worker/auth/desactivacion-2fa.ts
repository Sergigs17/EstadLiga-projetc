
import { verificarPassword } from './passwords'
import { consumirIntento } from './rate-limit'
import {
  obtenerUsuarioSesion,
  consultaRevocarOtrasSesiones,
  consultaComprobarSesionActual,
} from './sesiones'
import {
  descifrarSecretoTOTP,
  obtenerPasoTOTP,
} from './totp'

interface DesactivacionEnv {
  estadliga_db: D1Database
  TOTP_ENCRYPTION_KEY: string
}

interface Configuracion2FA {
  secreto_cifrado: string
  activado: number
  ultimo_paso_totp: number
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

export async function desactivar2FA(
  request: Request,
  env: DesactivacionEnv,
): Promise<Response> {
  // Comprobar que existe una sesión válida.
  const usuario = await obtenerUsuarioSesion(request, env)

  if (!usuario) {
    return json({ error: 'Debes iniciar sesión' }, 401)
  }

  // Limitar los intentos por IP y por cuenta.
  const limiteIP = await consumirIntento(
    request,
    env,
    '2fa_desactivar',
  )

  const limiteCuenta = await consumirIntento(
    request,
    env,
    '2fa_desactivar',
    String(usuario.id),
  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {
    return json({
      error: 'Demasiados intentos. Inténtalo más tarde.',
    }, 429)
  }

  // Comprobar el tipo de contenido.
  if (!(request.headers.get('Content-Type') ?? '')
    .toLowerCase().startsWith('application/json')) {
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

  const contenido = datos as Record<string, unknown>
  const password = contenido.password
  const codigo = contenido.codigo

  // Validar la contraseña recibida.
  if (
    typeof password !== 'string' ||
    password.length === 0 ||
    password.length > 128
  ) {
    return json({ error: 'Contraseña incorrecta' }, 401)
  }

  // Validar el formato del código TOTP.
  if (
    typeof codigo !== 'string' ||
    !/^\d{6}$/.test(codigo)
  ) {
    return json({
      error: 'Introduce un código de seis dígitos',
    }, 400)
  }

  // Obtener el hash de la contraseña.
  const cuenta = await env.estadliga_db
    .prepare(`
      SELECT password_hash
      FROM usuarios
      WHERE id = ?
    `)
    .bind(usuario.id)
    .first<{ password_hash: string }>()

  if (
    !cuenta ||
    !(await verificarPassword(password, cuenta.password_hash))
  ) {
    return json({ error: 'Contraseña incorrecta' }, 401)
  }

  // Obtener la configuración actual de Google Authenticator.
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

  // Descifrar el secreto y verificar el código.
  const secreto = await descifrarSecretoTOTP(
    configuracion.secreto_cifrado,
    env.TOTP_ENCRYPTION_KEY,
  )

  const paso = await obtenerPasoTOTP(secreto, codigo)

  // Impedir códigos incorrectos o reutilizados.
  if (
    paso === null ||
    paso <= configuracion.ultimo_paso_totp
  ) {
    return json({
      error: 'Código incorrecto o ya utilizado. Espera al siguiente código.',
    }, 401)
  }

  // Ejecutar todas las operaciones en una única transacción D1.
  const operaciones: D1PreparedStatement[] = [
    // La sesión actual debe continuar siendo válida.
    await consultaComprobarSesionActual(
      request,
      env,
      usuario.id,
    ),

    // Eliminar la configuración 2FA únicamente si sigue
    // coincidiendo con la que acabamos de verificar.
    env.estadliga_db
      .prepare(`
        DELETE FROM usuarios_2fa
        WHERE usuario_id = ?
          AND activado = 1
          AND secreto_cifrado = ?
          AND ultimo_paso_totp < ?
      `)
      .bind(
        usuario.id,
        configuracion.secreto_cifrado,
        paso,
      ),

    // Confirmar que se ha eliminado exactamente una fila.
    env.estadliga_db.prepare(`
      SELECT CASE
        WHEN changes() = 1 THEN 1
        ELSE json_extract('invalid-json', '$')
      END AS comprobacion
    `),

    // Eliminar todos los códigos de recuperación anteriores.
    env.estadliga_db
      .prepare(`
        DELETE FROM codigos_recuperacion_2fa
        WHERE usuario_id = ?
      `)
      .bind(usuario.id),

    // Invalidar todos los desafíos 2FA pendientes.
    // Un desafío antiguo no podrá utilizarse después
    // de desactivar o volver a activar el segundo factor.
    env.estadliga_db
      .prepare(`
        UPDATE desafios_2fa
        SET utilizado_en = ?
        WHERE usuario_id = ?
          AND utilizado_en IS NULL
      `)
      .bind(
        Math.floor(Date.now() / 1000),
        usuario.id,
      ),

    // Revocar las demás sesiones activas del usuario.
    await consultaRevocarOtrasSesiones(
      request,
      env,
      usuario.id,
    ),
  ]

  try {
    await env.estadliga_db.batch(operaciones)
  } catch {
    return json({
      error: 'No se ha podido desactivar Google Authenticator',
    }, 409)
  }

  return json({
    mensaje: 'Google Authenticator desactivado correctamente',
    activado: false,
  })
}
