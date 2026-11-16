import { useEffect, useRef, useState } from 'react'
import './MenuFavoritos.css'

type FavoritoEquipo = { id: number; nombre: string; escudo?: string | null }
type FavoritoJugador = { id: number; nombre: string; apellido?: string | null; equipo_id?: number | null }
type Favoritos = { equipos: FavoritoEquipo[]; jugadores: FavoritoJugador[] }

export default function MenuFavoritos() {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [favoritos, setFavoritos] = useState<Favoritos>({ equipos: [], jugadores: [] })
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const respuesta = await fetch('/api/favoritos', { credentials: 'same-origin', cache: 'no-store' })
        if (!respuesta.ok) throw new Error('No se pudieron cargar los favoritos')
        const datos = await respuesta.json() as Favoritos
        if (activo) setFavoritos(datos)
      } catch {
        if (activo) setError('No se pudieron cargar tus favoritos. Inténtalo de nuevo.')
      } finally {
        if (activo) setCargando(false)
      }
    }
    function cerrarFuera(evento: PointerEvent) {
      if (contenedor.current && !contenedor.current.contains(evento.target as Node)) setAbierto(false)
    }
    function cerrarEscape(evento: KeyboardEvent) { if (evento.key === 'Escape') setAbierto(false) }
    function cerrarNavegacion() { setAbierto(false) }
    void cargar()
    document.addEventListener('pointerdown', cerrarFuera)
    document.addEventListener('keydown', cerrarEscape)
    window.addEventListener('hashchange', cerrarNavegacion)
    return () => {
      activo = false
      document.removeEventListener('pointerdown', cerrarFuera)
      document.removeEventListener('keydown', cerrarEscape)
      window.removeEventListener('hashchange', cerrarNavegacion)
    }
  }, [abierto])

  return <div className="menu-favoritos" ref={contenedor}>
    <button className={`menu-favoritos-boton ${abierto ? 'abierto' : ''}`} type="button"
      aria-label="Abrir favoritos" title="Mis favoritos" aria-expanded={abierto}
      aria-controls="panel-favoritos" onClick={() => setAbierto(valor => !valor)}>
      <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path d="m12 2.7 2.9 5.85 6.45.94-4.67 4.55 1.1 6.43L12 17.44l-5.78 3.03 1.1-6.43-4.67-4.55 6.45-.94L12 2.7Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
    </button>
    {abierto && <div className="menu-favoritos-panel" id="panel-favoritos">
      <div className="menu-favoritos-titulo"><strong>Mis favoritos</strong><button type="button" aria-label="Cerrar favoritos" onClick={() => setAbierto(false)}>×</button></div>
      {cargando ? <p className="menu-favoritos-info">Cargando favoritos...</p> : error ? <p role="alert" className="menu-favoritos-info">{error}</p> : <>
        <div className="menu-favoritos-grupo"><h3>Equipos <span>{favoritos.equipos.length}</span></h3>
          {favoritos.equipos.length === 0 ? <p className="menu-favoritos-vacio">Todavía no tienes equipos favoritos.</p> : favoritos.equipos.map(e => <a href={`#/equipos/${e.id}`} key={e.id} onClick={() => setAbierto(false)}>{e.escudo && <img src={e.escudo} alt="" loading="lazy" />}<span>{e.nombre}</span><span aria-hidden="true">›</span></a>)}
        </div>
        <div className="menu-favoritos-grupo"><h3>Jugadores <span>{favoritos.jugadores.length}</span></h3>
          {favoritos.jugadores.length === 0 ? <p className="menu-favoritos-vacio">Todavía no tienes jugadores favoritos.</p> : favoritos.jugadores.map(j => <a href={`#/jugadores/${j.id}`} key={j.id} onClick={() => setAbierto(false)}><span className="menu-favoritos-jugador-icono">⚽</span><span>{j.nombre} {j.apellido ?? ''}</span><span aria-hidden="true">›</span></a>)}
        </div>
      </>}
      <a className="menu-favoritos-gestionar" href="#/favoritos" onClick={() => setAbierto(false)}>Gestionar favoritos →</a>
    </div>}
  </div>
}
