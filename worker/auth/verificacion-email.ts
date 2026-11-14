
interface EmailEnv {
  estadliga_db: D1Database
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
}

interface UsuarioPendiente {
  id: number
  nombre: string
  email: string
}

interface VerificacionBD {
  id: number
  usuario_id: number
  expira_en: string
}

const DURACION_TOKEN_MS = 24 * 60 * 60 * 1000
const ESPERA_REENVIO_SEGUNDOS = 60

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

function escaparHTML(valor: string): string {
  const caracteres: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return valor.replace(
    /[&<>"']/g,
    (caracter) => caracteres[caracter] ?? caracter,
  )
}

function generarToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function obtenerOrigenFrontend(request: Request): string {
  const url = new URL(request.url)

  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:5173'
  }

  return url.origin
}

function crearHTMLCorreo(
  nombre: string,
  enlace: string,
): string {
  const nombreSeguro = escaparHTML(nombre)
  const enlaceSeguro = escaparHTML(enlace)

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Verifica tu correo - EstadLiga</title>
      </head>
      <body style="margin:0;padding:32px;background:#f3f5f9;font-family:Arial,sans-serif;color:#202938">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:14px;padding:32px">
          <h1 style="color:#173b73">EstadLiga</h1>
          <h2>Verifica tu correo electrónico</h2>
          <p>Hola, ${nombreSeguro}.</p>
          <p>Gracias por registrarte en EstadLiga.</p>
          <p>Para activar tu cuenta, confirma tu dirección de correo electrónico.</p>
          <p style="margin:32px 0">
            <a
              href="${enlaceSeguro}"
              style="display:inline-block;background:#173b73;color:#ffffff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold"
            >
              Verificar mi correo
            </a>
          </p>
          <p>El enlace caduca en 24 horas y solo puede utilizarse una vez.</p>
          <p style="font-size:13px;color:#666">
            Si no has creado una cuenta en EstadLiga, ignora este mensaje.
          </p>
        </div>
      </body>
    </html>
  `
}

async function enviarConResend(
  env: EmailEnv,
  destinatario: string,
  nombre: string,
  enlace: string,
): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    console.error('[EstadLiga Email] Faltan variables de Resend')
    return false
  }

  try {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [destinatario],
        subject: 'Verifica tu correo electrónico | EstadLiga',
        html: crearHTMLCorreo(nombre, enlace),
      }),
    })

    if (!respuesta.ok) {
      console.error(
        '[EstadLiga Email] Resend respondió:',
        respuesta.status,
      )
      return false
    }

    return true
  } catch (error) {
    console.error('[EstadLiga Email] Error de conexión:', error)
    return false
  }
}

export async function enviarVerificacionEmail(
  request: Request,
  env: EmailEnv,
  usuarioId: number,
  nombre: string,
  email: string,
): Promise<boolean> {
  const token = generarToken()
  const tokenHash = await hashToken(token)
  const expiraEn = new Date(
    Date.now() + DURACION_TOKEN_MS,
  ).toISOString()

  const url = new URL(
    '/api/auth/verificar-email',
    obtenerOrigenFrontend(request),
  )
  url.searchParams.set('token', token)

  // Guardar primero el token para que el enlace
  // ya funcione cuando el usuario reciba el correo.
  // No invalidamos el enlace anterior si el envío falla.
  const guardado = await env.estadliga_db
    .prepare(`
      INSERT INTO verificaciones_email (
        usuario_id,
        token_hash,
        expira_en
      )
      VALUES (?, ?, ?)
    `)
    .bind(usuarioId, tokenHash, expiraEn)
    .run()

  if (!guardado.success) {
    return false
  }

  const enviado = await enviarConResend(
    env,
    email,
    nombre,
    url.toString(),
  )

  if (!enviado) {
    // Si falla Resend, eliminar únicamente el token
    // que acabamos de crear.
    await env.estadliga_db
      .prepare(`
        DELETE FROM verificaciones_email
        WHERE token_hash = ?
      `)
      .bind(tokenHash)
      .run()

    return false
  }

  // Conservar el token recién enviado y eliminar
  // los anteriores del mismo usuario.
  await env.estadliga_db
    .prepare(`
      DELETE FROM verificaciones_email
      WHERE usuario_id = ?
        AND token_hash != ?
    `)
    .bind(usuarioId, tokenHash)
    .run()

  return true
}

function paginaResultado(
  titulo: string,
  mensaje: string,
  correcto: boolean,
  request: Request,
): Response {
  const color = correcto ? '#167347' : '#b42318'
  const origen = obtenerOrigenFrontend(request)
  const urlLogin = escaparHTML(
    new URL('/login', origen).toString(),
  )

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Verificación - EstadLiga</title>
      </head>
      <body style="background:#f3f5f9;font-family:Arial,sans-serif;padding:32px;text-align:center">
        <main style="max-width:480px;margin:48px auto;background:white;border-radius:14px;padding:40px">
          <h1>EstadLiga</h1>
          <h2 style="color:${color}">${escaparHTML(titulo)}</h2>
          <p>${escaparHTML(mensaje)}</p>
          <a href="${urlLogin}">Ir a iniciar sesión</a>
        </main>
      </body>
    </html>
  `

  return new Response(html, {
    status: correcto ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function verificarEmail(
  request: Request,
  env: EmailEnv,
): Promise<Response> {
  const url = new URL(request.url)
  const token = url.searchParams.get('token') ?? ''

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return paginaResultado(
      'Enlace no válido',
      'El enlace de verificación no es válido.',
      false,
      request,
    )
  }

  const tokenHash = await hashToken(token)
  const ahora = new Date().toISOString()

  const verificacion = await env.estadliga_db
    .prepare(`
      SELECT id, usuario_id, expira_en
      FROM verificaciones_email
      WHERE token_hash = ?
        AND consumido_en IS NULL
      LIMIT 1
    `)
    .bind(tokenHash)
    .first<VerificacionBD>()

  if (
    !verificacion ||
    Date.parse(verificacion.expira_en) <= Date.now()
  ) {
    return paginaResultado(
      'Enlace caducado o utilizado',
      'Solicita un nuevo correo de verificación.',
      false,
      request,
    )
  }

  const resultados = await env.estadliga_db.batch([
    env.estadliga_db
      .prepare(`
        UPDATE verificaciones_email
        SET consumido_en = ?
        WHERE id = ?
          AND token_hash = ?
          AND consumido_en IS NULL
          AND expira_en > ?
      `)
      .bind(
        ahora,
        verificacion.id,
        tokenHash,
        ahora,
      ),

    env.estadliga_db
      .prepare(`
        UPDATE usuarios
        SET email_verificado = 1
        WHERE id = ?
          AND email_verificado = 0
          AND EXISTS (
            SELECT 1
            FROM verificaciones_email
            WHERE id = ?
              AND token_hash = ?
              AND consumido_en = ?
          )
      `)
      .bind(
        verificacion.usuario_id,
        verificacion.id,
        tokenHash,
        ahora,
      ),
  ])

  if (
    resultados[0].meta.changes !== 1 ||
    resultados[1].meta.changes !== 1
  ) {
    return paginaResultado(
      'No se ha podido verificar',
      'El enlace ya se ha utilizado o no es válido.',
      false,
      request,
    )
  }

  return paginaResultado(
    'Correo verificado correctamente',
    'Tu cuenta de EstadLiga está activada. Ya puedes iniciar sesión.',
    true,
    request,
  )
}

export async function reenviarVerificacion(
  email: string,
  request: Request,
  env: EmailEnv,
): Promise<Response> {
  // La validación y el límite de intentos
  // ya se realizan en index.ts.
  const usuario = await env.estadliga_db
    .prepare(`
      SELECT id, nombre, email
      FROM usuarios
      WHERE email = ?
        AND email_verificado = 0
      LIMIT 1
    `)
    .bind(email)
    .first<UsuarioPendiente>()

  const mensajeGenerico = {
    mensaje:
      'Si existe una cuenta pendiente con ese correo, recibirás un enlace de verificación.',
  }

  if (!usuario) {
    return json(mensajeGenerico)
  }

  const ultimoEnvio = await env.estadliga_db
    .prepare(`
      SELECT
        CAST(strftime('%s', creado_en) AS INTEGER)
          AS creado_segundos
      FROM verificaciones_email
      WHERE usuario_id = ?
      ORDER BY id DESC
      LIMIT 1
    `)
    .bind(usuario.id)
    .first<{ creado_segundos: number | null }>()

  if (ultimoEnvio?.creado_segundos != null) {
    const transcurridos =
      Math.floor(Date.now() / 1000) -
      ultimoEnvio.creado_segundos

    if (transcurridos < ESPERA_REENVIO_SEGUNDOS) {
      return json(mensajeGenerico)
    }
  }

  await enviarVerificacionEmail(
    request,
    env,
    usuario.id,
    usuario.nombre,
    usuario.email,
  )

  return json(mensajeGenerico)
}
