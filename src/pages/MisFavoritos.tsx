import { useEffect, useMemo, useState } from 'react'
import './MisFavoritos.css'

interface Usuario { id: number; nombre: string }
interface Equipo { id: number; nombre: string; escudo?: string | null }
interface Jugador { id: number; nombre: string; apellido?: string | null; posicion?: string | null; equipo_id?: number | null }
interface Favoritos { equipos: Equipo[]; jugadores: Jugador[] }
interface Props { usuario: Usuario | null; comprobandoSesion: boolean }
type Tipo = 'equipos' | 'jugadores'

export default function MisFavoritos({ usuario, comprobandoSesion }: Props) {
  const [tipo, setTipo] = useState<Tipo>('equipos')
  const [busqueda, setBusqueda] = useState('')
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [favoritos, setFavoritos] = useState<Favoritos>({ equipos: [], jugadores: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) { setCargando(false); setFavoritos({ equipos: [], jugadores: [] }); return }
    let activo = true
    setCargando(true)
    setError('')
    Promise.all([
      fetch('/api/equipos'), fetch('/api/jugadores'),
      fetch('/api/favoritos', { credentials: 'same-origin', cache: 'no-store' }),
    ]).then(async ([re, rj, rf]) => {
      if (!re.ok || !rj.ok || !rf.ok) throw new Error('No se han podido cargar los favoritos')
      return Promise.all([re.json() as Promise<Equipo[]>, rj.json() as Promise<Jugador[]>, rf.json() as Promise<Favoritos>])
    }).then(([e, j, f]) => { if (activo) { setEquipos(e); setJugadores(j); setFavoritos(f) } })
      .catch((err: unknown) => { if (activo) setError(err instanceof Error ? err.message : 'Error al cargar') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [usuario?.id])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase('es')
    const datos = tipo === 'equipos' ? equipos : jugadores
    return datos.filter((item) => `${item.nombre} ${'apellido' in item ? item.apellido ?? '' : ''}`.toLocaleLowerCase('es').includes(q)).slice(0, 120)
  }, [busqueda, tipo, equipos, jugadores])

  async function alternar(id: number) {
    const actuales = tipo === 'equipos' ? favoritos.equipos : favoritos.jugadores
    const guardado = actuales.some((item) => item.id === id)
    const clave = `${tipo}-${id}`
    setOcupado(clave)
    setError('')
    try {
      const respuesta = await fetch(`/api/favoritos/${tipo}${guardado ? `/${id}` : ''}`, {
        method: guardado ? 'DELETE' : 'POST',
        credentials: 'same-origin',
        headers: guardado ? undefined : { 'Content-Type': 'application/json' },
        body: guardado ? undefined : JSON.stringify({ id }),
      })
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => ({})) as { error?: string }
        throw new Error(datos.error ?? 'No se ha podido guardar el cambio')
      }
      const actualizados = await fetch('/api/favoritos', { credentials: 'same-origin', cache: 'no-store' })
      if (!actualizados.ok) throw new Error('No se han podido actualizar los favoritos')
      setFavoritos(await actualizados.json() as Favoritos)
      window.dispatchEvent(new Event('estadliga:favoritos-cambio'))
    } catch (err) { setError(err instanceof Error ? err.message : 'Error al guardar') }
    finally { setOcupado(null) }
  }

  if (comprobandoSesion) return <section className="seccion-contenido"><p>Comprobando sesión...</p></section>
  if (!usuario) return <section className="seccion-contenido"><h1>Mis favoritos</h1><p>Inicia sesión para guardar tus equipos y jugadores favoritos.</p><a className="boton-principal" href="#/login">Iniciar sesión</a></section>
  return <section className="seccion-contenido mis-favoritos">
    <h1>Mis favoritos</h1>
    <p>Elige tantos equipos y jugadores como quieras. Se guardarán en tu cuenta.</p>
    <div className="favoritos-resumen"><span>Equipos favoritos: <strong>{favoritos.equipos.length}</strong></span><span>Jugadores favoritos: <strong>{favoritos.jugadores.length}</strong></span></div>
    <div className="favoritos-pestanas">
      <button type="button" className={tipo === 'equipos' ? 'seleccionado' : ''} onClick={() => { setTipo('equipos'); setBusqueda('') }}>Equipos</button>
      <button type="button" className={tipo === 'jugadores' ? 'seleccionado' : ''} onClick={() => { setTipo('jugadores'); setBusqueda('') }}>Jugadores</button>
    </div>
    <label className="favoritos-busqueda">Buscar {tipo === 'equipos' ? 'equipo' : 'jugador'}
      <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Escribe un nombre..." />
    </label>
    {error && <p className="favoritos-error" role="alert">{error}</p>}
    {cargando ? <p>Cargando...</p> : <div className="favoritos-lista">
      {lista.map((item) => {
        const marcado = (tipo === 'equipos' ? favoritos.equipos : favoritos.jugadores).some((f) => f.id === item.id)
        return <div className="favoritos-elemento" key={`${tipo}-${item.id}`}>
          <div><strong>{item.nombre}{'apellido' in item && item.apellido ? ` ${item.apellido}` : ''}</strong>{'posicion' in item && item.posicion && <small>{item.posicion}</small>}</div>
          <button type="button" disabled={ocupado !== null} aria-pressed={marcado} onClick={() => void alternar(item.id)}>{ocupado === `${tipo}-${item.id}` ? 'Guardando...' : marcado ? '★ Favorito' : '☆ Añadir'}</button>
        </div>
      })}
      {lista.length === 0 && <p>No hay resultados para esa búsqueda.</p>}
    </div>}
  </section>
}
