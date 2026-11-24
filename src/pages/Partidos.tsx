import { useEffect, useMemo, useRef, useState } from 'react'
import './Partidos.css'

type Partido = {
  id?: number
  jornada: number | null
  descansoLocal?: number | null
  descansoVisitante?: number | null
  estado: string
  fecha: string
  local: string | number
  visitante: string | number
  golesLocal: number | null
  golesVisitante: number | null
}
type Respuesta = { partidos: Partido[] }
type EventoDirecto = {
  time?: { elapsed?: number; extra?: number | null }
  team?: { name?: string }
  player?: { name?: string }
  assist?: { name?: string }
  type?: string
  detail?: string
}
type PartidoDirecto = {
  fixture: { id: number; date: string; status: { short: string; elapsed?: number | null } }
  teams: { home: { name: string }; away: { name: string } }
  goals: { home: number | null; away: number | null }
  events?: EventoDirecto[]
  actualizado_en?: string
}
type RespuestaDirecto = { ok: boolean; partidos: PartidoDirecto[] }

const estadosApiDirecto = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'])
const aliasEquipos: Record<string, string> = {
  'sevilla': 'sevilla', 'real betis': 'betis', 'betis': 'betis',
  'atletico madrid': 'atlmadrid', 'atletico de madrid': 'atlmadrid',
  'athletic bilbao': 'athletic', 'athletic club': 'athletic',
  'barcelona': 'barcelona', 'fc barcelona': 'barcelona',
  'real madrid': 'realmadrid', 'real madrid cf': 'realmadrid',
  'deportivo alaves': 'alaves', 'alaves': 'alaves',
  'racing santander': 'racingsantander', 'racing de santander': 'racingsantander',
  'racing': 'racingsantander', 'real racing club': 'racingsantander',
  'deportivo la coruna': 'deportivocoruna', 'rc deportivo': 'deportivocoruna',
  'rc deportivo de la coruna': 'deportivocoruna',
  'espanyol': 'espanyol', 'rcd espanyol': 'espanyol',
  'celta vigo': 'celta', 'celta de vigo': 'celta', 'rc celta de vigo': 'celta',
  'rayo vallecano': 'rayovallecano', 'real sociedad': 'realsociedad',
  'osasuna': 'osasuna', 'ca osasuna': 'osasuna',
  'villarreal': 'villarreal', 'villarreal cf': 'villarreal',
  'valencia': 'valencia', 'valencia cf': 'valencia',
  'getafe': 'getafe', 'getafe cf': 'getafe',
  'levante': 'levante', 'levante ud': 'levante',
  'elche': 'elche', 'elche cf': 'elche',
  'malaga': 'malaga', 'malaga cf': 'malaga',
}
function claveEquipo(nombre: string | number) {
  const clave = normalizar(String(nombre))
  return aliasEquipos[clave] ?? ESCUDOS[clave] ?? clave
}
function buscarDirecto(partido: Partido, directos: PartidoDirecto[]) {
  const fecha = Date.parse(partido.fecha)
  if (!Number.isFinite(fecha)) return undefined
  return directos.find(d =>
    Math.abs(Date.parse(d.fixture.date) - fecha) <= 2 * 60 * 60 * 1000 &&
    claveEquipo(partido.local) === claveEquipo(d.teams.home.name) &&
    claveEquipo(partido.visitante) === claveEquipo(d.teams.away.name)
  )
}
function descripcionEvento(evento: EventoDirecto) {
  if (evento.type === 'Goal') return '⚽ Gol'
  if (evento.type === 'Card') return evento.detail?.toLowerCase().includes('red') ? '🟥 Tarjeta roja' : '🟨 Tarjeta amarilla'
  if (evento.type === 'subst') return '🔄 Sustitución'
  return evento.detail || evento.type || 'Evento'
}


const formatoHora = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit'
})
const formatoDia = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long'
})
const estadosFinales = new Set(['FINISHED', 'AWARDED'])
const estadosDirecto = new Set(['IN_PLAY', 'PAUSED', 'HALFTIME', 'LIVE'])


// Escudos locales: los mismos recursos que utiliza la página Equipos.
const ESCUDOS: Record<string, string> = {
  'athletic club':'athletic','athletic':'athletic',
  'club atletico de madrid':'atlmadrid','atletico de madrid':'atlmadrid','atletico madrid':'atlmadrid',
  'ca osasuna':'osasuna','osasuna':'osasuna','club atletico osasuna':'osasuna',
  'rc celta de vigo':'celta','celta de vigo':'celta','celta':'celta',
  'deportivo alaves':'alaves','alaves':'alaves',
  'elche cf':'elche','elche':'elche',
  'fc barcelona':'barcelona','barcelona':'barcelona',
  'getafe cf':'getafe','getafe':'getafe',
  'levante ud':'levante','levante':'levante',
  'malaga cf':'malaga','malaga':'malaga',
'real racing club':'racingsantander',
'real racing club de santander':'racingsantander',
'racing de santander':'racingsantander',
'racing santander':'racingsantander',  'rayo vallecano de madrid':'rayovallecano','rayo vallecano':'rayovallecano',
  'rc deportivo la coruna':'deportivocoruna','rc deportivo':'deportivocoruna','deportivo de la coruna':'deportivocoruna',
  'rcd espanyol de barcelona':'espanyol','rcd espanyol':'espanyol','espanyol':'espanyol',
  'real betis balompie':'betis','real betis':'betis','betis':'betis',
  'real madrid cf':'realmadrid','real madrid':'realmadrid',
  'real sociedad de futbol':'realsociedad','real sociedad':'realsociedad',
  'sevilla fc':'sevilla','sevilla':'sevilla',
  'valencia cf':'valencia','valencia':'valencia',
  'villarreal cf':'villarreal','villarreal':'villarreal',
}
const normalizar = (nombre: string) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
function EscudoEquipo({ nombre }: { nombre: string | number }) {
  const ruta = ESCUDOS[normalizar(String(nombre))]
  return ruta ? <img className="partidos-escudo" src={`/escudos/${ruta}.png`} alt={`Escudo de ${nombre}`} loading="lazy" /> : <span className="partidos-escudo-vacio" aria-hidden="true">⚽</span>
}

function Partidos() {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [directos, setDirectos] = useState<PartidoDirecto[]>([])
  const [jornada, setJornada] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [equipoFiltro, setEquipoFiltro] = useState('')
  const [partidoAbierto, setPartidoAbierto] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/partidos', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        return response.json() as Promise<Respuesta>
      })
      .then(data => {
        if (!Array.isArray(data.partidos)) throw new Error('Respuesta de partidos no válida')
        setPartidos(data.partidos)
      })
      .catch(err => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'No se pudo cargar el calendario')
      })
      .finally(() => { if (!controller.signal.aborted) setCargando(false) })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    let activo = true
    const consultar = async () => {
      try {
        const response = await fetch('/api/partidos/directo', { cache: 'no-store' })
        if (!response.ok) return
        const datos = await response.json() as RespuestaDirecto
        if (activo && datos.ok && Array.isArray(datos.partidos)) setDirectos(datos.partidos)
      } catch (error) {
        console.warn('No se pudo actualizar el directo:', error)
      }
    }
    void consultar()
    const intervalo = window.setInterval(() => { void consultar() }, 60_000)
    return () => { activo = false; window.clearInterval(intervalo) }
  }, [])

  const jornadas = useMemo(() =>
    [...new Set(partidos.map(p => p.jornada).filter((n): n is number => typeof n === 'number'))].sort((a, b) => a - b),
    [partidos]
  )
  const jornadaActual = useMemo(() => {
    const ahora = Date.now()
    const pendientes = partidos
      .filter(p => p.jornada !== null && !estadosFinales.has(p.estado))
      .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha))
    const proxima = pendientes.find(p => Date.parse(p.fecha) >= ahora - 3 * 60 * 60 * 1000) ?? pendientes[0]
    return proxima?.jornada ?? jornadas[jornadas.length - 1] ?? null
  }, [partidos, jornadas])
  const seleccionada = jornada ?? jornadaActual
  const equipos = useMemo(() => [...new Set(partidos.flatMap(p => [String(p.local), String(p.visitante)]))].sort((a, b) => a.localeCompare(b, 'es')), [partidos])
  const visibles = partidos
    .filter(p => p.jornada === seleccionada && (!equipoFiltro || String(p.local) === equipoFiltro || String(p.visitante) === equipoFiltro))
    .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha))

  // Los partidos de la jornada, agrupados por día.
  const dias = useMemo(() => {
    const grupos: { clave: string; titulo: string; partidos: Partido[] }[] = []
    for (const p of visibles) {
      const marca = Date.parse(p.fecha)
      const titulo = Number.isNaN(marca) ? 'Fecha pendiente' : formatoDia.format(marca)
      const ultimo = grupos[grupos.length - 1]
      if (ultimo && ultimo.titulo === titulo) ultimo.partidos.push(p)
      else grupos.push({ clave: titulo, titulo, partidos: [p] })
    }
    return grupos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partidos, seleccionada, equipoFiltro])

  const indice = seleccionada !== null ? jornadas.indexOf(seleccionada) : -1
  const anterior = indice > 0 ? jornadas[indice - 1] : null
  const siguiente = indice >= 0 && indice < jornadas.length - 1 ? jornadas[indice + 1] : null

  // Mantener visible en la tira la jornada elegida.
  const tira = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const activa = tira.current?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (activa && tira.current) {
      tira.current.scrollTo({
        left: activa.offsetLeft - tira.current.clientWidth / 2 + activa.clientWidth / 2,
        behavior: 'smooth',
      })
    }
  }, [seleccionada, jornadas.length])

  return (
    <section className="seccion-contenido pagina-partidos">
      <div className="partidos-portada">
        <div className="partidos-portada-texto">
          <span className="subtitulo">TEMPORADA 2026/27</span>
          <h2>Calendario de LaLiga</h2>
          <p>Primera División</p>
        </div>
        {seleccionada !== null && (
          <div className="partidos-portada-jornada" aria-live="polite">
            <button
              type="button"
              className="partidos-flecha"
              aria-label="Jornada anterior"
              disabled={anterior === null}
              onClick={() => anterior !== null && setJornada(anterior)}
            >
              ‹
            </button>
            <div className="partidos-portada-numero">
              <small>Jornada</small>
              <strong>{seleccionada}</strong>
            </div>
            <button
              type="button"
              className="partidos-flecha"
              aria-label="Jornada siguiente"
              disabled={siguiente === null}
              onClick={() => siguiente !== null && setJornada(siguiente)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {cargando && <p role="status">Cargando calendario…</p>}
      {error && <p role="alert" className="partidos-error">{error}</p>}
      {!cargando && !error && jornadas.length === 0 && (
        <div className="partidos-vacio">
          <span aria-hidden="true">⚽</span>
          <p>No hay partidos disponibles todavía.</p>
        </div>
      )}

      {jornadas.length > 0 && (
        <>
          <div className="partidos-selector">
            <div className="partidos-tira" ref={tira} role="group" aria-label="Elegir jornada">
              {jornadas.map(n => (
                <button
                  key={n}
                  type="button"
                  className={n === jornadaActual ? 'es-actual' : ''}
                  aria-pressed={n === seleccionada}
                  aria-label={`Jornada ${n}${n === jornadaActual ? ' (actual)' : ''}`}
                  onClick={() => setJornada(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="partidos-actual"
              onClick={() => setJornada(jornadaActual)}
              disabled={seleccionada === jornadaActual}
            >
              Ir a la jornada actual
            </button>
          </div>

          <div className="partidos-filtros">
            <label htmlFor="partidos-equipo-filtro">Filtrar por equipo</label>
            <select id="partidos-equipo-filtro" value={equipoFiltro} onChange={e => setEquipoFiltro(e.target.value)}>
              <option value="">Todos los equipos</option>
              {equipos.map(equipo => <option key={equipo} value={equipo}>{equipo}</option>)}
            </select>
            <span>{visibles.length} {visibles.length === 1 ? 'encuentro' : 'encuentros'} en esta jornada</span>
          </div>
          {visibles.length === 0 && <p className="partidos-sin-resultados">No hay encuentros de este equipo en la jornada seleccionada.</p>}

          {dias.map(dia => (
            <div className="partidos-dia" key={dia.clave}>
              <h3 className="partidos-dia-titulo">
                <span>{dia.titulo}</span>
                <small>{dia.partidos.length} {dia.partidos.length === 1 ? 'partido' : 'partidos'}</small>
              </h3>
              <div className="partidos-lista">
                {dia.partidos.map((p, i) => {
                  const api = buscarDirecto(p, directos)
                  const apiActivo = api && estadosApiDirecto.has(api.fixture.status.short)
                  const enDirecto = Boolean(apiActivo) || estadosDirecto.has(p.estado)
                  const terminado = !enDirecto && estadosFinales.has(p.estado)
                  const golesLocal = apiActivo && api?.goals.home != null ? api.goals.home : p.golesLocal
                  const golesVisitante = apiActivo && api?.goals.away != null ? api.goals.away : p.golesVisitante
                  const marcador = golesLocal !== null && golesVisitante !== null
                  const minuto = apiActivo ? api?.fixture.status.elapsed : null
                  const fecha = Date.parse(p.fecha)
                  const gana = terminado && marcador
                    ? golesLocal! > golesVisitante! ? 'local'
                      : golesLocal! < golesVisitante! ? 'visitante' : 'empate'
                    : null
                  const clave = String(p.id ?? `${p.fecha}-${p.local}-${p.visitante}`)
                  const abierto = partidoAbierto === clave
                  return (
                    <article
                      className={`partido ${enDirecto ? 'partido-directo' : ''} ${terminado ? 'partido-final' : ''}`}
                      key={`${clave}-${i}`}
                    >
                      <div className="partido-meta">
                        <strong>{Number.isNaN(fecha) ? '—' : formatoHora.format(fecha)}</strong>
                        <span className={`partido-estado ${enDirecto ? 'en-directo' : ''}`}>
                          {enDirecto && <i aria-hidden="true" />}
                          {enDirecto ? (minuto != null ? `${minuto}′ · En directo` : 'En directo') : terminado ? 'Finalizado' : p.estado === 'POSTPONED' ? 'Aplazado' : 'Programado'}
                        </span>
                      </div>
                      <div className="partido-cruce">
                        <div className={`partido-equipo partido-local ${gana === 'local' ? 'ganador' : gana === 'visitante' ? 'perdedor' : ''}`}>
                          <span className="partido-nombre">{String(p.local)}</span>
                          <EscudoEquipo nombre={p.local} />
                        </div>
                        <div className="partido-marcador" aria-label={marcador ? `${golesLocal} a ${golesVisitante}` : 'Aún sin jugar'}>
                          {marcador ? (
                            <>
                              <b>{golesLocal}</b><span>-</span><b>{golesVisitante}</b>
                            </>
                          ) : (
                            <em>vs</em>
                          )}
                        </div>
                        <div className={`partido-equipo partido-visitante ${gana === 'visitante' ? 'ganador' : gana === 'local' ? 'perdedor' : ''}`}>
                          <EscudoEquipo nombre={p.visitante} />
                          <span className="partido-nombre">{String(p.visitante)}</span>
                        </div>
                      </div>
                      {p.id != null && <a className="partido-pagina-detalle" href={`#/partidos/${p.id}`}>Ver ficha completa del partido →</a>}
                      <button className="partido-ver-detalles" type="button" aria-expanded={abierto} onClick={() => setPartidoAbierto(abierto ? null : clave)}>
                        {abierto ? 'Ocultar detalles' : 'Ver detalles del encuentro'} <span aria-hidden="true">{abierto ? '⌃' : '⌄'}</span>
                      </button>
                      {abierto && <div className="partido-detalles">
                        <h4>Información del encuentro</h4>
                        <dl>
                          <div><dt>Jornada</dt><dd>{p.jornada ?? 'Por determinar'}</dd></div>
                          <div><dt>Fecha</dt><dd>{Number.isNaN(fecha) ? 'Por confirmar' : new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' }).format(fecha)}</dd></div>
                          <div><dt>Estado</dt><dd>{enDirecto ? 'En juego' : terminado ? 'Finalizado' : p.estado === 'POSTPONED' ? 'Aplazado' : p.estado === 'CANCELLED' ? 'Cancelado' : 'Programado'}</dd></div>
                          {p.descansoLocal != null && p.descansoVisitante != null && <div><dt>Resultado al descanso</dt><dd>{p.descansoLocal} - {p.descansoVisitante}</dd></div>}
                          {marcador && <div><dt>Resultado</dt><dd>{golesLocal} - {golesVisitante}</dd></div>}
                        </dl>
                        {api && Array.isArray(api.events) && api.events.length > 0 && (
                          <div className="partidos-eventos">
                            <h4>Eventos del partido</h4>
                            <ol>
                              {api.events.map((evento, indiceEvento) => (
                                <li key={`${api.fixture.id}-${indiceEvento}`}>
                                  <span className="partidos-evento-minuto">{evento.time?.elapsed ?? '—'}′{evento.time?.extra ? `+${evento.time.extra}` : ''}</span>
                                  <span><strong>{descripcionEvento(evento)}</strong> · {evento.player?.name ?? 'Jugador sin identificar'}{evento.team?.name ? ` (${evento.team.name})` : ''}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        {!api && <p>Los eventos detallados todavía no están disponibles para este encuentro.</p>}
                        {api && <p>Las alineaciones y estadísticas ampliadas se incorporarán próximamente.</p>}
                      </div>}
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
          <p className="partidos-aviso">Calendario y resultados finales: Football-Data.org. Marcadores y eventos en directo: API-Football, cuando estén disponibles. Los datos pueden actualizarse con retraso.</p>
        </>
      )}
    </section>
  )
}

export default Partidos
