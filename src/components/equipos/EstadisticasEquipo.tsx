import { useEffect, useState } from 'react'
import type { Equipo } from '../../pages/Equipos'
import './EstadisticasEquipo.css'

const TORNEO_LALIGA = 8
const TEMPORADA_ACTUAL = 97268

interface RespuestaEstadisticas {
  equipo: {
    id: number
    nombre: string
  }
  unique_tournament_id: number
  season_id: number
  origen: string
  actualizado_en: string
  datos: {
    statistics?: Record<string, number | string | null>
  }
}

interface EstadisticasEquipoProps {
  equipo: Equipo
}

interface DatoEstadistico {
  clave: string
  etiqueta: string
  formato?: 'porcentaje' | 'decimal'
}

interface GrupoEstadisticas {
  titulo: string
  descripcion: string
  datos: DatoEstadistico[]
}

const GRUPOS: GrupoEstadisticas[] = [
  {
    titulo: 'Ataque',
    descripcion: 'La capacidad ofensiva del equipo',
    datos: [
      { clave: 'goalsScored', etiqueta: 'Goles a favor' },
      { clave: 'goalsConceded', etiqueta: 'Goles en contra' },
      { clave: 'shots', etiqueta: 'Tiros totales' },
      { clave: 'shotsOnTarget', etiqueta: 'Tiros a puerta' },
      { clave: 'bigChances', etiqueta: 'Grandes ocasiones' },
      { clave: 'expectedGoals', etiqueta: 'Goles esperados (xG)', formato: 'decimal' },
      { clave: 'assists', etiqueta: 'Asistencias' },
      { clave: 'corners', etiqueta: 'Saques de esquina' },
    ],
  },
  {
    titulo: 'Posesión y pases',
    descripcion: 'Cómo controla el balón el equipo',
    datos: [
      { clave: 'averageBallPossession', etiqueta: 'Posesión media', formato: 'porcentaje' },
      { clave: 'totalPasses', etiqueta: 'Pases intentados' },
      { clave: 'accuratePasses', etiqueta: 'Pases acertados' },
      { clave: 'accuratePassesPercentage', etiqueta: 'Precisión de pase', formato: 'porcentaje' },
      { clave: 'keyPasses', etiqueta: 'Pases clave' },
      { clave: 'accurateLongBallsPercentage', etiqueta: 'Precisión en pases largos', formato: 'porcentaje' },
    ],
  },
  {
    titulo: 'Defensa',
    descripcion: 'El trabajo defensivo del equipo',
    datos: [
      { clave: 'cleanSheets', etiqueta: 'Porterías a cero' },
      { clave: 'tackles', etiqueta: 'Entradas' },
      { clave: 'interceptions', etiqueta: 'Intercepciones' },
      { clave: 'clearances', etiqueta: 'Despejes' },
      { clave: 'saves', etiqueta: 'Paradas' },
      { clave: 'ballRecovery', etiqueta: 'Recuperaciones' },
      { clave: 'goalsPrevented', etiqueta: 'Goles evitados', formato: 'decimal' },
    ],
  },
  {
    titulo: 'Disciplina',
    descripcion: 'Faltas y tarjetas durante la temporada',
    datos: [
      { clave: 'fouls', etiqueta: 'Faltas cometidas' },
      { clave: 'yellowCards', etiqueta: 'Tarjetas amarillas' },
      { clave: 'redCards', etiqueta: 'Tarjetas rojas' },
      { clave: 'offsides', etiqueta: 'Fueras de juego' },
      { clave: 'penaltiesCommited', etiqueta: 'Penaltis cometidos' },
    ],
  },
]

function formatearValor(
  valor: number | string | null,
  formato?: DatoEstadistico['formato'],
): string {
  if (valor === null || valor === undefined || valor === '') {
    return '—'
  }

  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return String(valor)
  }

  if (formato === 'porcentaje') {
    return `${numero.toLocaleString('es-ES', {
      maximumFractionDigits: 1,
    })} %`
  }

  if (formato === 'decimal') {
    return numero.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  return numero.toLocaleString('es-ES', {
    maximumFractionDigits: 0,
  })
}

function EstadisticasEquipo({ equipo }: EstadisticasEquipoProps) {
  const [estadisticas, setEstadisticas] =
    useState<RespuestaEstadisticas | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarEstadisticas() {
      setCargando(true)
      setError(false)
      setEstadisticas(null)

      try {
        const respuesta = await fetch(
          `/api/equipos/${equipo.id}/estadisticas?unique_tournament_id=${TORNEO_LALIGA}&season_id=${TEMPORADA_ACTUAL}`,
          { signal: controlador.signal },
        )

        if (!respuesta.ok) {
          throw new Error('No se han encontrado estadísticas para este equipo')
        }

        const datos =
          (await respuesta.json()) as RespuestaEstadisticas

        if (!datos.datos?.statistics) {
          throw new Error('La respuesta no contiene estadísticas')
        }

        setEstadisticas(datos)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError(true)
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargarEstadisticas()

    return () => controlador.abort()
  }, [equipo.id])

  return (
    <section className="seccion-estadisticas-equipo">
      <header className="estadisticas-cabecera">
        <div>
          <span className="subtitulo">TEMPORADA 2026/27</span>
          <h2>Estadísticas del equipo</h2>
          <p>
            Rendimiento de {equipo.nombre} en LaLiga.
          </p>
        </div>

        {estadisticas && (
          <span className="estadisticas-partidos">
            {formatearValor(
              estadisticas.datos.statistics?.matches ?? null,
            )}{' '}
            partidos
          </span>
        )}
      </header>

      {cargando && (
        <div className="estadisticas-mensaje" role="status">
          <span className="estadisticas-cargando-icono" aria-hidden="true">
            ⚽
          </span>
          <p>Cargando estadísticas del equipo...</p>
        </div>
      )}

      {error && !cargando && (
        <div className="estadisticas-mensaje" role="alert">
          <h3>Estadísticas no disponibles</h3>
          <p>
            No hemos podido cargar los datos de este equipo. Inténtalo
            de nuevo más tarde.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(false)
              setCargando(true)
              setEstadisticas(null)

              fetch(
                `/api/equipos/${equipo.id}/estadisticas?unique_tournament_id=${TORNEO_LALIGA}&season_id=${TEMPORADA_ACTUAL}`,
              )
                .then((respuesta) => {
                  if (!respuesta.ok) {
                    throw new Error('Error al cargar las estadísticas')
                  }
                  return respuesta.json() as Promise<RespuestaEstadisticas>
                })
                .then((datos) => {
                  if (!datos.datos?.statistics) {
                    throw new Error('No hay estadísticas disponibles')
                  }
                  setEstadisticas(datos)
                })
                .catch(() => setError(true))
                .finally(() => setCargando(false))
            }}
          >
            Volver a intentar
          </button>
        </div>
      )}

      {estadisticas && !cargando && (
        <>
          <div className="estadisticas-resumen">
            <article className="estadistica-destacada">
              <span>Goles a favor</span>
              <strong>
                {formatearValor(
                  estadisticas.datos.statistics?.goalsScored ?? null,
                )}
              </strong>
            </article>

            <article className="estadistica-destacada">
              <span>Goles en contra</span>
              <strong>
                {formatearValor(
                  estadisticas.datos.statistics?.goalsConceded ?? null,
                )}
              </strong>
            </article>

            <article className="estadistica-destacada">
              <span>Posesión media</span>
              <strong>
                {formatearValor(
                  estadisticas.datos.statistics?.averageBallPossession ?? null,
                  'porcentaje',
                )}
              </strong>
            </article>

            <article className="estadistica-destacada">
              <span>Goles esperados (xG)</span>
              <strong>
                {formatearValor(
                  estadisticas.datos.statistics?.expectedGoals ?? null,
                  'decimal',
                )}
              </strong>
            </article>
          </div>

          {GRUPOS.map((grupo) => {
            const datosDisponibles = grupo.datos.filter(
              (dato) =>
                estadisticas.datos.statistics?.[dato.clave] !== null &&
                estadisticas.datos.statistics?.[dato.clave] !== undefined,
            )

            if (datosDisponibles.length === 0) {
              return null
            }

            return (
              <section
                className="grupo-estadisticas-equipo"
                key={grupo.titulo}
              >
                <div className="titulo-grupo-estadisticas">
                  <div>
                    <h3>{grupo.titulo}</h3>
                    <p>{grupo.descripcion}</p>
                  </div>
                </div>

                <div className="rejilla-estadisticas">
                  {datosDisponibles.map((dato) => (
                    <article
                      className="tarjeta-estadistica"
                      key={dato.clave}
                    >
                      <span>{dato.etiqueta}</span>
                      <strong>
                        {formatearValor(
                          estadisticas.datos.statistics?.[dato.clave] ?? null,
                          dato.formato,
                        )}
                      </strong>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}

          <p className="estadisticas-pie">
            Datos de LaLiga · Temporada 2026/27
            {estadisticas.actualizado_en && (
              <> · Actualizado el {estadisticas.actualizado_en}</>
            )}
          </p>
        </>
      )}
    </section>
  )
}

export default EstadisticasEquipo