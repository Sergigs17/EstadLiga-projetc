import { obtenerUsuarioSesion } from './auth/sesiones'

interface EnvPerfil { estadliga_db: D1Database }
interface PerfilBD { usuario_id: number; alias: string; nombre_visible: string; biografia: string; equipo_favorito_id: number | null; avatar: string; tema: string; perfil_publico: number; completado: number }
const respuesta = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
const AVATARES = ['balon', 'campo', 'trofeo', 'escudo', 'estrella']
const LIMITE = 4096

export async function manejarPerfil(request: Request, env: EnvPerfil): Promise<Response | null> {
  const url = new URL(request.url)
  if (url.pathname !== '/api/perfil') return null
  if (request.method !== 'GET' && request.method !== 'PUT') return respuesta({ error: 'Método no permitido' }, 405)
  if (request.method === 'PUT') {
    const origen = request.headers.get('Origin')
    const local = url.hostname === 'localhost' && url.port === '8788' && origen === 'http://localhost:5173'
    if (!origen || (origen !== url.origin && !local)) return respuesta({ error: 'Origen no autorizado' }, 403)
    if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) return respuesta({ error: 'Se requiere JSON' }, 415)
    if (Number(request.headers.get('Content-Length') || 0) > LIMITE) return respuesta({ error: 'Solicitud demasiado grande' }, 413)
  }
  try {
    const usuario = await obtenerUsuarioSesion(request, env)
    if (!usuario) return respuesta({ error: 'Inicia sesión para acceder a tu perfil' }, 401)
    if (request.method === 'GET') {
      const perfil = await env.estadliga_db.prepare('SELECT * FROM perfiles_usuarios WHERE usuario_id = ?').bind(usuario.id).first<PerfilBD>()
      return respuesta({ usuario, perfil: perfil ?? null })
    }
    const cuerpo = await request.text()
    if (cuerpo.length > LIMITE) return respuesta({ error: 'Solicitud demasiado grande' }, 413)
    let datos: Record<string, unknown>
    try { const parsed: unknown = JSON.parse(cuerpo); if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error(); datos = parsed as Record<string, unknown> } catch { return respuesta({ error: 'JSON no válido' }, 400) }
    const alias = typeof datos.alias === 'string' ? datos.alias.trim().toLowerCase() : ''
    const nombre = typeof datos.nombre_visible === 'string' ? datos.nombre_visible.trim() : ''
    const biografia = typeof datos.biografia === 'string' ? datos.biografia.trim() : ''
    const avatar = typeof datos.avatar === 'string' ? datos.avatar : ''
    const tema = datos.tema
    const publico = datos.perfil_publico
    const equipo = datos.equipo_favorito_id
    if (!/^[a-z0-9_]{3,24}$/.test(alias)) return respuesta({ error: 'El usuario debe tener 3-24 caracteres: letras minúsculas, números o _' }, 400)
    if (nombre.length < 2 || nombre.length > 60) return respuesta({ error: 'El nombre visible debe tener entre 2 y 60 caracteres' }, 400)
    if (biografia.length > 240) return respuesta({ error: 'La biografía no puede superar 240 caracteres' }, 400)
    if (!AVATARES.includes(avatar)) return respuesta({ error: 'Avatar no válido' }, 400)
    if (tema !== 'sistema' && tema !== 'claro' && tema !== 'oscuro') return respuesta({ error: 'Tema no válido' }, 400)
    if (typeof publico !== 'boolean') return respuesta({ error: 'Privacidad no válida' }, 400)
    if (equipo !== null && (!Number.isSafeInteger(equipo) || Number(equipo) <= 0)) return respuesta({ error: 'Equipo no válido' }, 400)
    if (equipo !== null) {
      const existe = await env.estadliga_db.prepare('SELECT id FROM equipos WHERE id = ?').bind(equipo).first()
      if (!existe) return respuesta({ error: 'El equipo seleccionado no existe' }, 400)
    }
    try {
      await env.estadliga_db.prepare(`INSERT INTO perfiles_usuarios (usuario_id, alias, nombre_visible, biografia, equipo_favorito_id, avatar, tema, perfil_publico, completado, actualizado_en)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(usuario_id) DO UPDATE SET alias=excluded.alias, nombre_visible=excluded.nombre_visible,
      biografia=excluded.biografia, equipo_favorito_id=excluded.equipo_favorito_id, avatar=excluded.avatar,
      tema=excluded.tema, perfil_publico=excluded.perfil_publico, completado=1, actualizado_en=CURRENT_TIMESTAMP`)
        .bind(usuario.id, alias, nombre, biografia, equipo, avatar, tema, publico ? 1 : 0).run()
    } catch (error) {
      if (String(error).includes('UNIQUE')) return respuesta({ error: 'Ese nombre de usuario ya está ocupado' }, 409)
      throw error
    }
    return respuesta({ mensaje: 'Perfil guardado correctamente' })
  } catch (error) {
    console.error('[EstadLiga perfil]', error)
    return respuesta({ error: 'No se pudo procesar el perfil. Comprueba que la migración SQL está aplicada.' }, 500)
  }
}
