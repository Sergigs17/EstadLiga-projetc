import { verificarTokenGoogle } from './google'
import { crearDesafio2FA } from './desafios'
import { consumirIntento } from './rate-limit'
import {
  crearSesion,
  cookieIniciarSesion,
} from './sesiones'

interface GoogleAuthEnv {
  estadliga_db: D1Database
  TOTP_ENCRYPTION_KEY: string
  GOOGLE_CLIENT_ID: string
}

interface UsuarioGoogle {
  id: number
  nombre: string
  email: string
  rol: 'usuario' | 'admin'
}

interface VinculoGoogle {
  usuario_id: number
}

function responder(
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

export async function iniciarSesionGoogle(
  request: Request,
  env: GoogleAuthEnv,
): Promise<Response> {
  const limite = await consumirIntento(request, env, 'login')

  if (!limite.permitido) {
    return responder({
      error: 'Demasiados intentos. Inténtalo más tarde.',
    }, 429, {
      'Retry-After': String(Math.max(1, limite.reintentarEn)),
    })
  }

  let credential: string

  try {
    const tipo = request.headers.get('Content-Type') ?? ''

    if (!tipo.toLowerCase().startsWith('application/json')) {
      return responder({ error: 'Solicitud no válida' }, 400)
    }

    const texto = await request.text()

    if (texto.length > 8192) {
      return responder({ error: 'Solicitud demasiado grande' }, 413)
    }

    const datos: unknown = JSON.parse(texto)

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      return responder({ error: 'Solicitud no válida' }, 400)
    }

    const valor = (datos as Record<string, unknown>).credential

    if (typeof valor !== 'string' || !valor || valor.length > 8192) {
      return responder({ error: 'Credencial no válida' }, 400)
    }

    credential = valor
  } catch {
    return responder({ error: 'Solicitud no válida' }, 400)
  }

  let identidad

  try {
    identidad = await verificarTokenGoogle(
      credential,
      env.GOOGLE_CLIENT_ID,
    )
  } catch {
    return responder({
      error: 'No se ha podido verificar la identidad de Google',
    }, 401)
  }

  const vinculo = await env.estadliga_db
    .prepare(`
      SELECT usuario_id
      FROM usuarios_proveedores
      WHERE proveedor = 'google' AND proveedor_id = ?
      LIMIT 1
    `)
    .bind(identidad.googleId)
    .first<VinculoGoogle>()

  let usuario: UsuarioGoogle | null = null

  if (vinculo) {
    usuario = await env.estadliga_db
      .prepare(`
        SELECT id, nombre, email, rol
        FROM usuarios
        WHERE id = ?
        LIMIT 1
      `)
      .bind(vinculo.usuario_id)
      .first<UsuarioGoogle>()

    if (!usuario) {
      return responder({
        error: 'No se ha podido recuperar la cuenta',
      }, 409)
    }
  } else {
    const existente = await env.estadliga_db
      .prepare(`
        SELECT id
        FROM usuarios
        WHERE email = ?
        LIMIT 1
      `)
      .bind(identidad.email)
      .first<{ id: number }>()

    if (existente) {
      return responder({
        error: 'Ya existe una cuenta con este correo. Inicia sesión con tu método habitual para vincular Google.',
      }, 409)
    }

    try {
      // D1 ejecuta las sentencias del batch en una transacción.
      // Si falla el vínculo, también se revierte la creación del usuario.
      await env.estadliga_db.batch([
        env.estadliga_db
          .prepare(`
            INSERT INTO usuarios (
              nombre, email, password_hash, rol
            )
            VALUES (?, ?, ?, 'usuario')
          `)
          .bind(
            identidad.nombre,
            identidad.email,
            '!oauth_sin_password',
          ),

        env.estadliga_db
          .prepare(`
            INSERT INTO usuarios_proveedores (
              usuario_id,
              proveedor,
              proveedor_id,
              email_proveedor
            )
            VALUES (
              (SELECT id FROM usuarios WHERE email = ?),
              'google',
              ?,
              ?
            )
          `)
          .bind(
            identidad.email,
            identidad.googleId,
            identidad.email,
          ),
      ])
    } catch {
      // Puede ocurrir si dos solicitudes intentan crear
      // simultáneamente la misma cuenta.
      return responder({
        error: 'No se ha podido completar el registro. Inténtalo de nuevo.',
      }, 409)
    }

    usuario = await env.estadliga_db
      .prepare(`
        SELECT u.id, u.nombre, u.email, u.rol
        FROM usuarios u
        INNER JOIN usuarios_proveedores p
          ON p.usuario_id = u.id
        WHERE p.proveedor = 'google'
          AND p.proveedor_id = ?
        LIMIT 1
      `)
      .bind(identidad.googleId)
      .first<UsuarioGoogle>()

    if (!usuario) {
      return responder({
        error: 'No se ha podido recuperar la cuenta creada',
      }, 500)
    }
  }

  const configuracion2FA = await env.estadliga_db
    .prepare(`
      SELECT activado
      FROM usuarios_2fa
      WHERE usuario_id = ?
      LIMIT 1
    `)
    .bind(usuario.id)
    .first<{ activado: number }>()

  if (configuracion2FA?.activado === 1) {
    const desafio = await crearDesafio2FA(env, usuario.id)

    return responder({
      requiere_2fa: true,
      desafio,
      expira_en_segundos: 300,
      mensaje: 'Introduce el código de Google Authenticator',
    })
  }

  const token = await crearSesion(env, usuario.id)

  return responder({
    mensaje: 'Sesión iniciada con Google correctamente',
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  }, 200, {
    'Set-Cookie': cookieIniciarSesion(request, token),
  })
}
