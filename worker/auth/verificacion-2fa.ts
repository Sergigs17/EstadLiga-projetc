
import { consumirIntento } from './rate-limit'
import { obtenerDesafio2FA } from './desafios'
import {
  descifrarSecretoTOTP,
  obtenerPasoTOTP,
} from './totp'
import {
  prepararSesion2FA,
  cookieIniciarSesion,
} from './sesiones'
import {
  calcularHashCodigoRecuperacion,
} from './recuperacion-2fa'

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
  // 1. Comprobar el tipo de contenido.
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
  const codigoRecuperacion = campos.codigo_recuperacion

  // 2. Identificar el método de verificación.
  const esTOTP =
    typeof codigo === 'string' &&
    /^\d{6}$/.test(codigo) &&
    codigoRecuperacion === undefined

  const esRecuperacion =
    typeof codigoRecuperacion === 'string' &&
    /^[0-9a-fA-F]{6}(?:-?[0-9a-fA-F]{6}){3}$/.test(
      codigoRecuperacion.trim(),
    ) &&
    codigo === undefined

  if (
    typeof desafio !== 'string' ||
    !/^[0-9a-f]{64}$/.test(desafio) ||
    (!esTOTP && !esRecuperacion)
  ) {
    return respuesta({
      error: 'Datos de verificación no válidos',
    }, 400)
  }

  // 3. Comprobar que el desafío existe y no ha caducado.
  const desafioBD = await obtenerDesafio2FA(env, desafio)

  if (!desafioBD) {
    return respuesta({
      error: 'Desafío no válido o caducado',
    }, 401)
  }

  // 4. Limitar intentos por IP y cuenta.
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
      {
        error: 'Demasiados intentos. Inténtalo más tarde.',
      },
      429,
      {
        'Retry-After': String(Math.max(1, espera)),
      },
    )
  }

  // 5. Obtener la configuración 2FA activa.
  const configuracion = await env.estadliga_db
    .prepare(`
      SELECT
        secreto_cifrado,
        ultimo_paso_totp
      FROM usuarios_2fa
      WHERE usuario_id = ?
        AND activado = 1
    `)
    .bind(desafioBD.usuario_id)
    .first<Configuracion2FA>()

  if (!configuracion) {
    return respuesta({
      error: 'Segundo factor no disponible',
    }, 401)
  }

  let paso: number | null = null
  let hashRecuperacion: string | null = null

  // 6. Verificar el código TOTP o preparar el hash
  // del código de recuperación.
  if (esTOTP) {
    const secreto = await descifrarSecretoTOTP(
      configuracion.secreto_cifrado,
      env.TOTP_ENCRYPTION_KEY,
    )

    paso = await obtenerPasoTOTP(
      secreto,
      codigo as string,
    )

    if (paso === null) {
      return respuesta({
        error: 'Código de verificación incorrecto',
      }, 401)
    }
  } else {
    hashRecuperacion =
      await calcularHashCodigoRecuperacion(
        codigoRecuperacion as string,
      )
  }

  // 7. Obtener el usuario.
  const usuario = await env.estadliga_db
    .prepare(`
      SELECT
        id,
        nombre,
        email,
        rol
      FROM usuarios
      WHERE id = ?
    `)
    .bind(desafioBD.usuario_id)
    .first<Usuario2FA>()

  if (!usuario) {
    return respuesta({
      error: 'Usuario no encontrado',
    }, 401)
  }

  const ahora = Math.floor(Date.now() / 1000)

  // Hace fallar la transacción si la operación anterior
  // no ha modificado exactamente una fila.
  const comprobarCambio = () =>
    env.estadliga_db.prepare(`
      SELECT CASE
        WHEN changes() = 1 THEN 1
        ELSE json_extract('invalid-json', '$')
      END AS comprobacion
    `)

  // 8. Preparar las operaciones de la transacción.
  const operaciones: D1PreparedStatement[] = [
    // Consumir el desafío.
    env.estadliga_db
      .prepare(`
        UPDATE desafios_2fa
        SET utilizado_en = ?
        WHERE id = ?
          AND usuario_id = ?
          AND utilizado_en IS NULL
          AND expira_en > ?
      `)
      .bind(
        ahora,
        desafioBD.id,
        usuario.id,
        ahora,
      ),

    comprobarCambio(),
  ]

  if (hashRecuperacion !== null) {
    // 9A. Consumir un código de recuperación.
    // Exigir que siga activa la misma configuración 2FA.
    operaciones.push(
      env.estadliga_db
        .prepare(`
          UPDATE codigos_recuperacion_2fa
          SET utilizado_en = CURRENT_TIMESTAMP
          WHERE usuario_id = ?
            AND codigo_hash = ?
            AND utilizado_en IS NULL
            AND EXISTS (
              SELECT 1
              FROM usuarios_2fa
              WHERE usuario_id = ?
                AND activado = 1
                AND secreto_cifrado = ?
            )
        `)
        .bind(
          usuario.id,
          hashRecuperacion,
          usuario.id,
          configuracion.secreto_cifrado,
        ),

      comprobarCambio(),
    )
  } else {
    // 9B. Consumir el paso TOTP.
    // Impedir su reutilización y comprobar el secreto vigente.
    operaciones.push(
      env.estadliga_db
        .prepare(`
          UPDATE usuarios_2fa
          SET ultimo_paso_totp = ?
          WHERE usuario_id = ?
            AND activado = 1
            AND ultimo_paso_totp < ?
            AND secreto_cifrado = ?
        `)
        .bind(
          paso,
          usuario.id,
          paso,
          configuracion.secreto_cifrado,
        ),

      comprobarCambio(),
    )
  }

  // 10. Preparar la sesión sin insertarla todavía.
  // Se exige el mismo secreto cifrado que se ha verificado.
  const sesionPreparada = await prepararSesion2FA(
    env,
    usuario.id,
    configuracion.secreto_cifrado,
  )

  // La sesión se insertará dentro de la misma transacción
  // que consume el desafío y el segundo factor.
  operaciones.push(
    sesionPreparada.consulta,
    comprobarCambio(),
  )

  // 11. Ejecutar todas las operaciones de forma atómica.
  try {
    await env.estadliga_db.batch(operaciones)
  } catch {
    return respuesta({
      error: 'Código o desafío ya utilizado, incorrecto o caducado',
    }, 401)
  }

  // 12. Entregar la sesión únicamente si la transacción
  // se ha completado correctamente.
  const token = sesionPreparada.token

  return respuesta({
    mensaje: 'Verificación completada correctamente',
    usuario,
  }, 200, {
    'Set-Cookie': cookieIniciarSesion(request, token),
  })
}
