import { consumirIntento } from './rate-limit'
import { obtenerDesafio2FA } from './desafios'
import { descifrarSecretoTOTP, obtenerPasoTOTP } from './totp'
import { crearSesion, cookieIniciarSesion } from './sesiones'

interface VerificacionEnv {
  estadliga_db: D1Database
  TOTP_ENCRYPTION_KEY: string
}

interface Configuracion2FA {
  secreto_cifrado: string
  ultimo_paso_totp: number
}

interface Usuario2FA {
  id: number
  nombre: string
  email: string
  rol: string
}

function respuesta(
  datos: unknown,
  status = 200,
  headers?: HeadersInit,
): Response {
  const cabeceras = new Headers(headers)
  cabeceras.set('Content-Type', 'application/json; charset=utf-8')
  cabeceras.set('Cache-Control', 'no-store')
  cabeceras.set('X-Content-Type-Options', 'nosniff')

  return new Response(JSON.stringify(datos), {
    status,
    headers: cabeceras,
  })
}

export async function verificarSegundoFactor(
  request: Request,
  env: VerificacionEnv,
): Promise<Response> {
  const tipo = request.headers.get('Content-Type') ?? ''

  if (!tipo.toLowerCase().startsWith('application/json')) {
    return respuesta({ error: 'Solicitud no válida' }, 400)
  }

  let datos: unknown

  try {
    datos = await request.json()
  } catch {
    return respuesta({ error: 'JSON no válido' }, 400)
  }

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return respuesta({ error: 'Solicitud no válida' }, 400)
  }

  const campos = datos as Record<string, unknown>
  const desafio = campos.desafio
  const codigo = campos.codigo

  if (
    typeof desafio !== 'string' ||
    !/^[0-9a-f]{64}$/.test(desafio) ||
    typeof codigo !== 'string' ||
    !/^\d{6}$/.test(codigo)
  ) {
    return respuesta({ error: 'Datos de verificación no válidos' }, 400)
  }

  const desafioBD = await obtenerDesafio2FA(env, desafio)

  if (!desafioBD) {
    return respuesta({ error: 'Desafío no válido o caducado' }, 401)
  }

  // Limitar intentos por IP y por cuenta antes de verificar TOTP.
  const limiteIP = await consumirIntento(
    request,
    env,
    '2fa_verificar',
  )

  const limiteCuenta = await consumirIntento(
    request,
    env,
    '2fa_verificar',
    String(desafioBD.usuario_id),
  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {
    const espera = Math.max(
      limiteIP.reintentarEn,
      limiteCuenta.reintentarEn,
    )

    return respuesta(
      { error: 'Demasiados intentos. Inténtalo más tarde.' },
      429,
      { 'Retry-After': String(Math.max(1, espera)) },
    )
  }

  const configuracion = await env.estadliga_db
    .prepare(`
      SELECT secreto_cifrado, ultimo_paso_totp
      FROM usuarios_2fa
      WHERE usuario_id = ?
        AND activado = 1
    `)
    .bind(desafioBD.usuario_id)
    .first<Configuracion2FA>()

  if (!configuracion) {
    return respuesta({ error: 'Segundo factor no disponible' }, 401)
  }

  const secreto = await descifrarSecretoTOTP(
    configuracion.secreto_cifrado,
    env.TOTP_ENCRYPTION_KEY,
  )

  const paso = await obtenerPasoTOTP(secreto, codigo)

  if (paso === null) {
    return respuesta({ error: 'Código de verificación incorrecto' }, 401)
  }

  // Reserva el intervalo TOTP de forma atómica.
  // Solo una petición puede avanzar el último paso aceptado.
  const reserva = await env.estadliga_db
    .prepare(`
      UPDATE usuarios_2fa
      SET ultimo_paso_totp = ?
      WHERE usuario_id = ?
        AND activado = 1
        AND ultimo_paso_totp < ?
    `)
    .bind(paso, desafioBD.usuario_id, paso)
    .run()

  if (reserva.meta.changes !== 1) {
    return respuesta({ error: 'Código ya utilizado' }, 401)
  }

  const usuario = await env.estadliga_db
    .prepare(`
      SELECT id, nombre, email, rol
      FROM usuarios
      WHERE id = ?
    `)
    .bind(desafioBD.usuario_id)
    .first<Usuario2FA>()

  if (!usuario) {
    return respuesta({ error: 'Usuario no encontrado' }, 401)
  }

  // Consumir el desafío de manera condicional.
  const ahora = Math.floor(Date.now() / 1000)

  const consumo = await env.estadliga_db
    .prepare(`
      UPDATE desafios_2fa
      SET utilizado_en = ?
      WHERE id = ?
        AND usuario_id = ?
        AND utilizado_en IS NULL
        AND expira_en > ?
    `)
    .bind(ahora, desafioBD.id, usuario.id, ahora)
    .run()

  if (consumo.meta.changes !== 1) {
    return respuesta({ error: 'Desafío ya utilizado o caducado' }, 401)
  }

  const token = await crearSesion(env, usuario.id)

  return respuesta({
    mensaje: 'Verificación completada correctamente',
    usuario,
  }, 200, {
    'Set-Cookie': cookieIniciarSesion(request, token),
  })
}
