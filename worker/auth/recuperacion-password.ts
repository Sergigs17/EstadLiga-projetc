import { crearHashPassword } from './passwords'
import { consumirIntento } from './rate-limit'

interface Env { estadliga_db: D1Database; RESEND_API_KEY: string; RESEND_FROM_EMAIL: string }
const MENSAJE = 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.'
const json = (dato: unknown, status = 200) => new Response(JSON.stringify(dato), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })
const hex = (bytes: Uint8Array) => Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('')
async function hash(token: string) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))) }
function origenSeguro(request: Request) { return new URL(request.url).origin }

export async function solicitarRecuperacion(request: Request, env: Env): Promise<Response> {
  const data: unknown = await request.json().catch(() => null)
  const email = data && typeof data === 'object' && 'email' in data && typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Introduce un correo válido.' }, 400)
  const limiteIP = await consumirIntento(request, env, 'recuperacion_password')
  const limiteCuenta = await consumirIntento(request, env, 'recuperacion_password', email)
  if (!limiteIP.permitido || !limiteCuenta.permitido) return json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, 429)
  const usuario = await env.estadliga_db.prepare('SELECT id FROM usuarios WHERE email = ? AND email_verificado = 1').bind(email).first<{id: number}>()
  if (!usuario) return json({ mensaje: MENSAJE })
  const token = hex(crypto.getRandomValues(new Uint8Array(32)))
  const tokenHash = await hash(token)
  const expira = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  await env.estadliga_db.prepare('INSERT INTO recuperaciones_password (usuario_id, token_hash, expira_en) VALUES (?, ?, ?)').bind(usuario.id, tokenHash, expira).run()
  const url = new URL(origenSeguro(request) + '/#/login')
  url.hash = '/login?recuperar=' + encodeURIComponent(token)
  if (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    try {
      const respuesta = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to: [email], subject: 'Recuperar contraseña de EstadLiga',
          html: `<div style="font-family:Arial,sans-serif;max-width:540px;margin:auto"><h2>EstadLiga</h2><p>Has solicitado cambiar tu contraseña.</p><p><a href="${url.toString()}">Restablecer contraseña</a></p><p>El enlace caduca en 30 minutos y solo se puede usar una vez. Si no lo has solicitado, ignora este correo.</p></div>` })
      })
      if (!respuesta.ok) console.error('[Recuperación] Error del proveedor:', respuesta.status)
    } catch { console.error('[Recuperación] No se pudo enviar el correo') }
  } else console.error('[Recuperación] Resend no configurado')
  return json({ mensaje: MENSAJE })
}

export async function restablecerPassword(request: Request, env: Env): Promise<Response> {
  const data: unknown = await request.json().catch(() => null)
  if (!data || typeof data !== 'object' || !('token' in data) || !('password' in data)) return json({ error: 'Datos inválidos.' }, 400)
  const token = data.token, password = data.password
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token) || typeof password !== 'string' || password.length < 12 || password.length > 128 || new TextEncoder().encode(password).length > 512) return json({ error: 'Enlace o contraseña no válidos. La contraseña debe tener entre 12 y 128 caracteres.' }, 400)
  const limite = await consumirIntento(request, env, 'restablecer_password')
  if (!limite.permitido) return json({ error: 'Demasiados intentos. Inténtalo más tarde.' }, 429)
  const tokenHash = await hash(token)
  const ahora = new Date().toISOString()
  const nuevaHash = await crearHashPassword(password)
  // El UPDATE condicional consume el token de forma atómica.
  const resultado = await env.estadliga_db.prepare('UPDATE recuperaciones_password SET usado_en = ? WHERE token_hash = ? AND usado_en IS NULL AND expira_en > ? RETURNING usuario_id').bind(ahora, tokenHash, ahora).first<{usuario_id:number}>()
  if (!resultado) return json({ error: 'Este enlace ha caducado o ya se ha utilizado. Solicita uno nuevo.' }, 400)
  await env.estadliga_db.batch([
    env.estadliga_db.prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?').bind(nuevaHash, resultado.usuario_id),
    env.estadliga_db.prepare('UPDATE sesiones_usuarios SET revocado_en = ? WHERE usuario_id = ? AND revocado_en IS NULL').bind(ahora, resultado.usuario_id),
    env.estadliga_db.prepare('UPDATE recuperaciones_password SET usado_en = ? WHERE usuario_id = ? AND usado_en IS NULL').bind(ahora, resultado.usuario_id),
  ])
  return json({ mensaje: 'Contraseña cambiada. Inicia sesión con tu nueva contraseña.' })
}
