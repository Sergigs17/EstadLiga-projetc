
import {
  prepararCodigosRecuperacion,
  consultasGuardarCodigosRecuperacion,
} from './recuperacion-2fa'
import { verificarPassword } from './passwords'
import { consumirIntento } from './rate-limit'
import {
  obtenerUsuarioSesion,
  consultaRevocarOtrasSesiones,
  consultaComprobarSesionActual,
} from './sesiones'
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

  const limiteIP = await consumirIntento(
    request,
    env,
    '2fa_preparar',
  )

  const limiteCuenta = await consumirIntento(
    request,
    env,
    '2fa_preparar',
    String(usuario.id),
  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {
    const espera = Math.max(
      limiteIP.reintentarEn,
      limiteCuenta.reintentarEn,
    )

    return new Response(
      JSON.stringify({
        error: 'Demasiados intentos. Inténtalo más tarde.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, espera)),
        },
      },
    )
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

  const password = (datos as Record<string, unknown>).password

  if (
    typeof password !== 'string' ||
    password.length === 0 ||
    password.length > 128
  ) {
    return json({ error: 'Contraseña incorrecta' }, 401)
  }

  const cuenta = await env.estadliga_db
    .prepare('SELECT password_hash FROM usuarios WHERE id = ?')
    .bind(usuario.id)
    .first<{ password_hash: string }>()

  if (
    !cuenta ||
    !(await verificarPassword(password, cuenta.password_hash))
  ) {
    return json({ error: 'Contraseña incorrecta' }, 401)
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

  const resultado = await env.estadliga_db
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

  if (resultado.meta.changes !== 1) {
    return json({
      error: 'No se ha podido preparar el 2FA',
    }, 409)
  }

  return json({
    mensaje: 'Añade EstadLiga a Google Authenticator',
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

  const limiteIP = await consumirIntento(
    request,
    env,
    '2fa_activar',
  )

  const limiteCuenta = await consumirIntento(
    request,
    env,
    '2fa_activar',
    String(usuario.id),
  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {
    const espera = Math.max(
      limiteIP.reintentarEn,
      limiteCuenta.reintentarEn,
    )

    return new Response(
      JSON.stringify({
        error: 'Demasiados intentos. Inténtalo más tarde.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, espera)),
        },
      },
    )
  }

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

  const codigo = (datos as Record<string, unknown>).codigo

  if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
    return json({
      error: 'Introduce un código de seis dígitos',
    }, 400)
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
    return json({
      error: 'No hay una activación pendiente',
    }, 409)
  }

  const secreto = await descifrarSecretoTOTP(
    configuracion.secreto_cifrado,
    env.TOTP_ENCRYPTION_KEY,
  )

  const paso = await obtenerPasoTOTP(secreto, codigo)

  if (paso === null) {
    return json({ error: 'Código incorrecto' }, 401)
  }

  const { codigos, hashes } =
    await prepararCodigosRecuperacion()

  // Todas las operaciones se ejecutan en una transacción D1.
  const operaciones: D1PreparedStatement[] = [
    // La sesión que activa el 2FA debe seguir siendo válida.
    await consultaComprobarSesionActual(
      request,
      env,
      usuario.id,
    ),

    // Activar Google Authenticator solo si la configuración
    // sigue siendo la misma que acabamos de verificar.
    env.estadliga_db
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
      .bind(
        paso,
        usuario.id,
        configuracion.secreto_cifrado,
      ),

    // Exigir que exactamente una configuración se active.
    env.estadliga_db.prepare(`
      SELECT CASE
        WHEN changes() = 1 THEN 1
        ELSE json_extract('invalid-json', '$')
      END AS comprobacion
    `),

    // Guardar los códigos de recuperación.
    ...consultasGuardarCodigosRecuperacion(
      env,
      usuario.id,
      hashes,
    ),

    // Invalidar los desafíos anteriores de este usuario.
    // Así no podrán utilizarse después de la activación.
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

    // Cerrar las demás sesiones del usuario.
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
      error: 'No se ha podido activar el 2FA',
    }, 409)
  }

  return json({
    mensaje: 'Google Authenticator activado correctamente',
    activado: true,
    codigos_recuperacion: codigos,
    aviso: 'Guarda estos códigos ahora. No volverán a mostrarse.',
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
