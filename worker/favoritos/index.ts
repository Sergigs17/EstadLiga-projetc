import { obtenerUsuarioSesion } from '../auth/sesiones'

interface EnvFavoritos { estadliga_db: D1Database }
type Clase = 'equipos' | 'jugadores'

function json(datos: unknown, status = 200): Response {
  return Response.json(datos, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

function origenPermitido(request: Request): boolean {
  const origen = request.headers.get('Origin')
  if (!origen) return false
  const url = new URL(request.url)
  return origen === url.origin ||
    (url.hostname === 'localhost' && url.port === '8788' && origen === 'http://localhost:5173')
}

async function leerId(request: Request): Promise<number | null> {
  if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) return null
  const longitud = Number(request.headers.get('Content-Length') ?? 0)
  if (longitud > 1024) return null
  try {
    const texto = await request.text()
    if (texto.length > 1024) return null
    const datos: unknown = JSON.parse(texto)
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return null
    const id = (datos as { id?: unknown }).id
    return typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? id : null
  } catch { return null }
}

export async function manejarFavoritos(request: Request, env: EnvFavoritos): Promise<Response | null> {
  const url = new URL(request.url)
  if (url.pathname !== '/api/favoritos' && !url.pathname.startsWith('/api/favoritos/')) return null
  const ruta = url.pathname.match(/^\/api\/favoritos\/(equipos|jugadores)(?:\/(\d+))?$/)
  const esListado = url.pathname === '/api/favoritos'
  const metodo = request.method
  if (!((esListado && metodo === 'GET') ||
    (ruta && ((metodo === 'POST' && !ruta[2]) || (metodo === 'DELETE' && !!ruta[2]))))) {
    return json({ error: 'Ruta o método no permitido' }, esListado || ruta ? 405 : 404)
  }
  if (metodo !== 'GET' && !origenPermitido(request)) return json({ error: 'Origen no autorizado' }, 403)
  try {
    const usuario = await obtenerUsuarioSesion(request, env)
    if (!usuario) return json({ error: 'Inicia sesión para gestionar tus favoritos' }, 401)
    if (esListado) {
      const [equipos, jugadores] = await Promise.all([
        env.estadliga_db.prepare(`SELECT e.id, e.nombre, e.escudo FROM favoritos_equipos f JOIN equipos e ON e.id=f.equipo_id WHERE f.usuario_id=? ORDER BY e.nombre`).bind(usuario.id).all(),
        env.estadliga_db.prepare(`SELECT j.id, j.nombre, j.apellido, j.posicion, j.equipo_id FROM favoritos_jugadores f JOIN jugadores j ON j.id=f.jugador_id WHERE f.usuario_id=? ORDER BY j.nombre, j.apellido`).bind(usuario.id).all(),
      ])
      return json({ equipos: equipos.results, jugadores: jugadores.results })
    }
    const clase = ruta![1] as Clase
    const tabla = clase === 'equipos' ? 'equipos' : 'jugadores'
    const tablaFav = clase === 'equipos' ? 'favoritos_equipos' : 'favoritos_jugadores'
    const columna = clase === 'equipos' ? 'equipo_id' : 'jugador_id'
    const id = metodo === 'POST' ? await leerId(request) : Number(ruta![2])
    if (!id || !Number.isSafeInteger(id) || id <= 0) return json({ error: 'ID no válido' }, 400)
    if (metodo === 'POST') {
      const existe = await env.estadliga_db.prepare(`SELECT id FROM ${tabla} WHERE id=?`).bind(id).first()
      if (!existe) return json({ error: 'No existe en EstadLiga' }, 404)
      await env.estadliga_db.prepare(`INSERT OR IGNORE INTO ${tablaFav} (usuario_id, ${columna}) VALUES (?, ?)`).bind(usuario.id, id).run()
      return json({ mensaje: 'Favorito guardado', id }, 200)
    }
    await env.estadliga_db.prepare(`DELETE FROM ${tablaFav} WHERE usuario_id=? AND ${columna}=?`).bind(usuario.id, id).run()
    return json({ mensaje: 'Favorito eliminado', id })
  } catch (error) {
    console.error('[EstadLiga Favoritos]', error)
    return json({ error: 'No se ha podido completar la operación' }, 500)
  }
}
