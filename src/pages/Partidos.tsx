import { useEffect, useMemo, useRef, useState } from 'react'
import './Partidos.css'

type Partido = {
  jornada: number | null
  estado: string
  fecha: string
  local: string | number
  visitante: string | number
  golesLocal: number | null
  golesVisitante: number | null
}
type Respuesta = { partidos: Partido[] }

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
  const [jornada, setJornada] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

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
  const visibles = partidos
    .filter(p => p.jornada === seleccionada)
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
  }, [partidos, seleccionada])

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

          {dias.map(dia => (
            <div className="partidos-dia" key={dia.clave}>
              <h3 className="partidos-dia-titulo">
                <span>{dia.titulo}</span>
                <small>{dia.partidos.length} {dia.partidos.length === 1 ? 'partido' : 'partidos'}</small>
              </h3>
              <div className="partidos-lista">
                {dia.partidos.map((p, i) => {
                  const enDirecto = estadosDirecto.has(p.estado)
                  const terminado = estadosFinales.has(p.estado)
                  const marcador = p.golesLocal !== null && p.golesVisitante !== null
                  const fecha = Date.parse(p.fecha)
                  const gana = terminado && marcador
                    ? p.golesLocal! > p.golesVisitante! ? 'local'
                      : p.golesLocal! < p.golesVisitante! ? 'visitante' : 'empate'
                    : null
                  return (
                    <article
                      className={`partido ${enDirecto ? 'partido-directo' : ''} ${terminado ? 'partido-final' : ''}`}
                      key={`${p.fecha}-${p.local}-${p.visitante}-${i}`}
                    >
                      <div className="partido-meta">
                        <strong>{Number.isNaN(fecha) ? '—' : formatoHora.format(fecha)}</strong>
                        <span className={`partido-estado ${enDirecto ? 'en-directo' : ''}`}>
                          {enDirecto && <i aria-hidden="true" />}
                          {enDirecto ? 'En juego' : terminado ? 'Finalizado' : p.estado === 'POSTPONED' ? 'Aplazado' : 'Programado'}
                        </span>
                      </div>
                      <div className="partido-cruce">
                        <div className={`partido-equipo partido-local ${gana === 'local' ? 'ganador' : gana === 'visitante' ? 'perdedor' : ''}`}>
                          <span className="partido-nombre">{String(p.local)}</span>
                          <EscudoEquipo nombre={p.local} />
                        </div>
                        <div className="partido-marcador" aria-label={marcador ? `${p.golesLocal} a ${p.golesVisitante}` : 'Aún sin jugar'}>
                          {marcador ? (
                            <>
                              <b>{p.golesLocal}</b><span>-</span><b>{p.golesVisitante}</b>
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
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
          <p className="partidos-aviso">Los resultados y estados proceden de Football-Data.org y pueden actualizarse con retraso. El directo de Apify se añadirá en la siguiente fase.</p>
        </>
      )}
    </section>
  )
}

export default Partidos
