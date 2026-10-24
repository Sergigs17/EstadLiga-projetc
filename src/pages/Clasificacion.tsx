
import { useEffect, useState } from 'react'
import './Clasificacion.css'

interface EquipoClasificacion {
  id: number
  nombre: string
  escudo: string
  posicion: number
  partidosJugados: number
  victorias: number
  empates: number
  derrotas: number
  golesFavor: number
  golesContra: number
  diferenciaGoles: number
  puntos: number
}

interface RespuestaClasificacion {
  season?: {
    currentMatchday?: number
  }
  standings?: {
    table?: Array<{
      position: number
      team: {
        id: number
        name: string
        shortName?: string
        crest: string
      }
      playedGames: number
      won: number
      draw: number
      lost: number
      points: number
      goalsFor: number
      goalsAgainst: number
      goalDifference: number
    }>
  }[]
}

function repararTexto(texto: string): string {
  const errores: Record<string, string> = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã¼': 'ü',
    'Ã€': 'À',
    'Ã‰': 'É',
    'Ã': 'Í',
    'Ã“': 'Ó',
    'Ãš': 'Ú',
    'Ã‘': 'Ñ',
    'Ã§': 'ç',
    'Ã ': 'à',
  }

  return texto.replace(
    /Ã¡|Ã©|Ã­|Ã³|Ãº|Ã±|Ã¼|Ã€|Ã‰|Ã|Ã“|Ãš|Ã‘|Ã§|Ã /g,
    (caracter) => errores[caracter] ?? caracter,
  )
}

function Clasificacion() {
  const [equipos, setEquipos] = useState<EquipoClasificacion[]>([])
  const [jornada, setJornada] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarClasificacion() {
      try {
        setCargando(true)
        setError('')

        const respuesta = await fetch('/api/clasificacion', {
          signal: controlador.signal,
        })

        if (!respuesta.ok) {
          throw new Error(
            `No se pudo cargar la clasificación (${respuesta.status}).`,
          )
        }

        const datos: RespuestaClasificacion = await respuesta.json()
        const tabla = datos.standings?.find(
          (grupo) => grupo.table && grupo.table.length > 0,
        )?.table

        if (!tabla || tabla.length === 0) {
          throw new Error(
            'La API no ha devuelto equipos en la clasificación.',
          )
        }

        const equiposTransformados = tabla.map((fila) => ({
          id: fila.team.id,
          nombre: repararTexto(fila.team.name),
          escudo: fila.team.crest,
          posicion: fila.position,
          partidosJugados: fila.playedGames,
          victorias: fila.won,
          empates: fila.draw,
          derrotas: fila.lost,
          golesFavor: fila.goalsFor,
          golesContra: fila.goalsAgainst,
          diferenciaGoles: fila.goalDifference,
          puntos: fila.points,
        }))

        setEquipos(equiposTransformados)
        setJornada(datos.season?.currentMatchday ?? null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return

        setError(
          err instanceof Error
            ? err.message
            : 'Ha ocurrido un error al cargar la clasificación.',
        )
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarClasificacion()

    return () => controlador.abort()
  }, [])

  return (
    <section className="seccion-contenido pagina-clasificacion">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">TEMPORADA ACTUAL</span>
          <h2>Clasificación de LaLiga</h2>
        </div>

        <p>Primera División</p>
      </div>

      <div className="clasificacion-contenido">
        <div className="clasificacion-cabecera">
          <div>
            <h3>Clasificación de la temporada</h3>
            <p>
              Consulta los puntos, los resultados y los goles de cada equipo.
            </p>
          </div>

          {jornada !== null && (
            <span className="etiqueta-jornada">
              Jornada {jornada}
            </span>
          )}
        </div>

        {cargando && (
          <div className="clasificacion-mensaje">
            Cargando clasificación...
          </div>
        )}

        {!cargando && error && (
          <div className="clasificacion-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Volver a intentarlo
            </button>
          </div>
        )}

        {!cargando && !error && (
          <div className="tabla-clasificacion-contenedor">
            <table className="tabla-clasificacion">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Equipo</th>
                  <th scope="col" title="Partidos jugados">PJ</th>
                  <th scope="col" title="Victorias">G</th>
                  <th scope="col" title="Empates">E</th>
                  <th scope="col" title="Derrotas">P</th>
                  <th scope="col" title="Goles a favor">GF</th>
                  <th scope="col" title="Goles en contra">GC</th>
                  <th scope="col" title="Diferencia de goles">DG</th>
                  <th scope="col">Pts</th>
                </tr>
              </thead>

              <tbody>
                {equipos.map((equipo) => (
                  <tr key={equipo.id}>
                    <td className="posicion-equipo">
                      {equipo.posicion}
                    </td>

                    <td>
                      <div className="equipo-clasificacion">
                        <img
                          src={equipo.escudo}
                          alt=""
                          className="escudo-clasificacion"
                          loading="lazy"
                          onError={(evento) => {
                            evento.currentTarget.style.visibility = 'hidden'
                          }}
                        />
                        <span>{equipo.nombre}</span>
                      </div>
                    </td>

                    <td>{equipo.partidosJugados}</td>
                    <td>{equipo.victorias}</td>
                    <td>{equipo.empates}</td>
                    <td>{equipo.derrotas}</td>
                    <td>{equipo.golesFavor}</td>
                    <td>{equipo.golesContra}</td>
                    <td>
                      {equipo.diferenciaGoles > 0
                        ? `+${equipo.diferenciaGoles}`
                        : equipo.diferenciaGoles}
                    </td>
                    <td className="puntos-equipo">{equipo.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grafico-pendiente">
        <h3>Evolución de los equipos</h3>
        <p>
          Aquí podrás consultar cómo cambia la posición de cada equipo
          a lo largo de las jornadas de LaLiga.
        </p>

        <div className="grafico-placeholder">
          <span>📈</span>
          <p>Gráfico de posiciones por jornada</p>
          <small>
            Pendiente de disponer de datos históricos de cada jornada.
          </small>
        </div>
      </div>
    </section>
  )
}

export default Clasificacion
