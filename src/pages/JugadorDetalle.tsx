
import { useEffect, useMemo, useState } from 'react'
import './JugadorDetalle.css'
import type { Jugador } from './EquipoDetalle'

interface JugadorDetalleProps {
  jugador: Jugador
}

interface RespuestaEstadisticas {
  jugador: {
    id: number
    nombre: string
    sofascore_id: number | null
  }
  unique_tournament_id: number
  season_id: number
  origen: string
  actualizado_en?: string
  datos: {
    statistics?: Record<string, unknown>
    seasonRatingBreakdown?: Record<string, unknown>
    team?: {
      name?: string
      imagePath?: string
      nameCode?: string
    }
  }
}

interface Temporada {
  id: number
  nombre: string
}

const TORNEO_LALIGA = 8
const TEMPORADA_INICIAL = 97268

const NOMBRES_ESTADISTICAS: Record<string, string> = {
  rating: 'Valoración media',
  totalRating: 'Valoración acumulada',
  countRating: 'Partidos con valoración',
  appearances: 'Partidos jugados',
  matchesStarted: 'Partidos como titular',
  minutesPlayed: 'Minutos jugados',
  goals: 'Goles',
  assists: 'Asistencias',
  goalInvolvements: 'Participaciones en goles',
  goalsAssistsSum: 'Goles + asistencias',
  expectedGoals: 'Goles esperados (xG)',
  expectedAssists: 'Asistencias esperadas (xA)',
  expectedGoalInvolvements: 'Participaciones esperadas en goles',
  bigChancesCreated: 'Ocasiones claras creadas',
  bigChancesMissed: 'Ocasiones claras falladas',
  totalShots: 'Tiros totales',
  shotsOnTarget: 'Tiros a puerta',
  shotsOffTarget: 'Tiros fuera',
  blockedShots: 'Tiros bloqueados',
  goalConversionPercentage: 'Conversión de tiros',
  scoringFrequency: 'Minutos por gol',
  goalsFromInsideTheBox: 'Goles dentro del área',
  goalsFromOutsideTheBox: 'Goles fuera del área',
  shotsFromInsideTheBox: 'Tiros dentro del área',
  shotsFromOutsideTheBox: 'Tiros fuera del área',
  headedGoals: 'Goles de cabeza',
  leftFootGoals: 'Goles con la izquierda',
  rightFootGoals: 'Goles con la derecha',
  penaltiesTaken: 'Penaltis lanzados',
  penaltyGoals: 'Penaltis marcados',
  penaltyWon: 'Penaltis provocados',
  penaltyConceded: 'Penaltis cometidos',
  penaltyConversion: 'Conversión de penaltis',
  attemptPenaltyMiss: 'Penaltis fallados',
  attemptPenaltyPost: 'Penaltis al poste',
  attemptPenaltyTarget: 'Penaltis a puerta',
  shotFromSetPiece: 'Tiros a balón parado',
  freeKickGoal: 'Goles de falta directa',
  setPieceConversion: 'Conversión a balón parado',
  accuratePasses: 'Pases acertados',
  inaccuratePasses: 'Pases fallados',
  totalPasses: 'Pases totales',
  accuratePassesPercentage: 'Precisión de pase',
  keyPasses: 'Pases clave',
  accurateOwnHalfPasses: 'Pases acertados en campo propio',
  accurateOppositionHalfPasses: 'Pases acertados en campo rival',
  totalOwnHalfPasses: 'Pases en campo propio',
  totalOppositionHalfPasses: 'Pases en campo rival',
  accurateFinalThirdPasses: 'Pases acertados en el último tercio',
  accurateLongBalls: 'Balones largos acertados',
  accurateLongBallsPercentage: 'Precisión en balones largos',
  totalLongBalls: 'Balones largos totales',
  accurateCrosses: 'Centros acertados',
  accurateCrossesPercentage: 'Precisión en centros',
  totalCross: 'Centros intentados',
  totalChippedPasses: 'Pases bombeados intentados',
  accurateChippedPasses: 'Pases bombeados acertados',
  passToAssist: 'Pases previos a una asistencia',
  totalAttemptAssist: 'Pases que intentan generar una asistencia',
  successfulDribbles: 'Regates completados',
  successfulDribblesPercentage: 'Éxito en regates',
  totalContest: 'Regates intentados',
  dispossessed: 'Veces que pierde el balón',
  unsuccessfulTouches: 'Controles fallidos',
  touches: 'Toques de balón',
  touchesInOppBox: 'Toques en el área rival',
  possessionLost: 'Posesiones perdidas',
  ballRecovery: 'Recuperaciones',
  possessionWonAttThird: 'Recuperaciones en campo rival',
  groundDuelsWon: 'Duelos terrestres ganados',
  groundDuelsWonPercentage: 'Porcentaje de duelos terrestres ganados',
  aerialDuelsWon: 'Duelos aéreos ganados',
  aerialDuelsWonPercentage: 'Porcentaje de duelos aéreos ganados',
  totalDuelsWon: 'Duelos totales ganados',
  totalDuelsWonPercentage: 'Porcentaje de duelos ganados',
  duelLost: 'Duelos perdidos',
  aerialLost: 'Duelos aéreos perdidos',
  tackles: 'Entradas',
  tacklesWon: 'Entradas ganadas',
  tacklesWonPercentage: 'Porcentaje de entradas ganadas',
  interceptions: 'Intercepciones',
  clearances: 'Despejes',
  outfielderBlocks: 'Bloqueos defensivos',
  defensiveContributions: 'Acciones defensivas',
  dribbledPast: 'Veces superado en regate',
  errorLeadToGoal: 'Errores que provocan gol',
  errorLeadToShot: 'Errores que provocan un tiro',
  fouls: 'Faltas cometidas',
  wasFouled: 'Faltas recibidas',
  yellowCards: 'Tarjetas amarillas',
  redCards: 'Tarjetas rojas',
  directRedCards: 'Rojas directas',
  yellowRedCards: 'Segundas amarillas',
  offsides: 'Fueras de juego',
  ownGoals: 'Goles en propia puerta',
  hitWoodwork: 'Tiros al poste o larguero',
  cleanSheet: 'Porterías a cero',
  goalsConceded: 'Goles encajados',
  goalsConcededInsideTheBox: 'Goles encajados dentro del área',
  goalsConcededOutsideTheBox: 'Goles encajados fuera del área',
  saves: 'Paradas',
  savesPercentage: 'Porcentaje de paradas',
  savedShotsFromInsideTheBox: 'Paradas dentro del área',
  savedShotsFromOutsideTheBox: 'Paradas fuera del área',
  penaltyFaced: 'Penaltis recibidos',
  penaltySave: 'Penaltis parados',
  penaltySavePercentage: 'Porcentaje de penaltis parados',
  goalKicks: 'Saques de puerta',
  punches: 'Despejes de puños',
  runsOut: 'Salidas',
  successfulRunsOut: 'Salidas acertadas',
  highClaims: 'Balones aéreos atrapados',
  crossesNotClaimed: 'Centros no blocados',
  savesCaught: 'Paradas blocadas',
  savesParried: 'Paradas despejadas',
  kilometersCovered: 'Kilómetros recorridos',
  kilometersCoveredPer90: 'Kilómetros por 90 minutos',
  metersCovered: 'Metros recorridos',
  metersCoveredRunning: 'Metros corriendo',
  metersCoveredHighSpeedRunning: 'Metros a alta velocidad',
  metersCoveredSprinting: 'Metros esprintando',
  metersCoveredWalking: 'Metros caminando',
  metersCoveredJogging: 'Metros trotando',
  metersCoveredWalkingJogging: 'Metros caminando y trotando',
  numberOfSprints: 'Número de esprints',
  numberOfSprintsPer90: 'Esprints por 90 minutos',
  topSpeed: 'Velocidad máxima',
  sprintingPercentage: 'Porcentaje de distancia esprintando',
  runningPercentage: 'Porcentaje de distancia corriendo',
  highSpeedRunningPercentage: 'Porcentaje de distancia a alta velocidad',
  walkingJoggingPercentage: 'Porcentaje de distancia caminando o trotando',
  totwAppearances: 'Apariciones en el equipo de la jornada',
}

const NOMBRES_VALORACION: Record<string, string> = {
  shotValue: 'Aportación en el tiro',
  passValue: 'Aportación en el pase',
  dribbleValue: 'Aportación en el regate',
  defensiveValue: 'Aportación defensiva',
}

const CATEGORIAS: { titulo: string; claves: string[] }[] = [
  {
    titulo: 'Rendimiento general',
    claves: [
      'rating', 'totalRating', 'countRating', 'appearances',
      'matchesStarted', 'minutesPlayed', 'goals', 'assists',
      'goalInvolvements', 'goalsAssistsSum', 'totwAppearances',
    ],
  },
  {
    titulo: 'Ataque y ocasiones',
    claves: [
      'expectedGoals', 'expectedAssists', 'expectedGoalInvolvements',
      'bigChancesCreated', 'bigChancesMissed', 'totalShots',
      'shotsOnTarget', 'shotsOffTarget', 'blockedShots',
      'goalConversionPercentage', 'scoringFrequency',
      'goalsFromInsideTheBox', 'goalsFromOutsideTheBox',
      'shotsFromInsideTheBox', 'shotsFromOutsideTheBox',
      'headedGoals', 'leftFootGoals', 'rightFootGoals',
      'penaltiesTaken', 'penaltyGoals', 'penaltyWon',
      'penaltyConceded', 'penaltyConversion', 'attemptPenaltyMiss',
      'attemptPenaltyPost', 'attemptPenaltyTarget',
      'shotFromSetPiece', 'freeKickGoal', 'setPieceConversion',
      'hitWoodwork', 'ownGoals',
    ],
  },
  {
    titulo: 'Pases y creación de juego',
    claves: [
      'accuratePasses', 'inaccuratePasses', 'totalPasses',
      'accuratePassesPercentage', 'keyPasses',
      'accurateOwnHalfPasses', 'accurateOppositionHalfPasses',
      'totalOwnHalfPasses', 'totalOppositionHalfPasses',
      'accurateFinalThirdPasses', 'accurateLongBalls',
      'accurateLongBallsPercentage', 'totalLongBalls',
      'accurateCrosses', 'accurateCrossesPercentage', 'totalCross',
      'totalChippedPasses', 'accurateChippedPasses',
      'passToAssist', 'totalAttemptAssist',
    ],
  },
  {
    titulo: 'Regates, balón y duelos',
    claves: [
      'successfulDribbles', 'successfulDribblesPercentage',
      'totalContest', 'dispossessed', 'unsuccessfulTouches',
      'touches', 'touchesInOppBox', 'possessionLost',
      'ballRecovery', 'possessionWonAttThird',
      'groundDuelsWon', 'groundDuelsWonPercentage',
      'aerialDuelsWon', 'aerialDuelsWonPercentage',
      'totalDuelsWon', 'totalDuelsWonPercentage',
      'duelLost', 'aerialLost', 'dribbledPast',
    ],
  },
  {
    titulo: 'Defensa y disciplina',
    claves: [
      'tackles', 'tacklesWon', 'tacklesWonPercentage',
      'interceptions', 'clearances', 'outfielderBlocks',
      'defensiveContributions', 'errorLeadToGoal',
      'errorLeadToShot', 'fouls', 'wasFouled', 'yellowCards',
      'redCards', 'directRedCards', 'yellowRedCards', 'offsides',
    ],
  },
  {
    titulo: 'Portería',
    claves: [
      'cleanSheet', 'goalsConceded', 'goalsConcededInsideTheBox',
      'goalsConcededOutsideTheBox', 'saves', 'savesPercentage',
      'savedShotsFromInsideTheBox', 'savedShotsFromOutsideTheBox',
      'penaltyFaced', 'penaltySave', 'penaltySavePercentage',
      'goalKicks', 'punches', 'runsOut', 'successfulRunsOut',
      'highClaims', 'crossesNotClaimed', 'savesCaught',
      'savesParried',
    ],
  },
  {
    titulo: 'Rendimiento físico',
    claves: [
      'kilometersCovered', 'kilometersCoveredPer90', 'metersCovered',
      'metersCoveredRunning', 'metersCoveredHighSpeedRunning',
      'metersCoveredSprinting', 'metersCoveredWalking',
      'metersCoveredJogging', 'metersCoveredWalkingJogging',
      'numberOfSprints', 'numberOfSprintsPer90', 'topSpeed',
      'sprintingPercentage', 'runningPercentage',
      'highSpeedRunningPercentage', 'walkingJoggingPercentage',
    ],
  },
]

function formatearNombre(clave: string) {
  return (
    NOMBRES_ESTADISTICAS[clave] ??
    clave
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (letra) => letra.toUpperCase())
  )
}

function formatearValor(clave: string, valor: unknown): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    if (typeof valor === 'string' || typeof valor === 'boolean') {
      return String(valor)
    }

    return '—'
  }

  if (
    clave.toLowerCase().includes('percentage') ||
    clave === 'penaltyConversion'
  ) {
    return `${valor.toLocaleString('es-ES', {
      maximumFractionDigits: 1,
    })}%`
  }

  if (clave === 'rating' || clave === 'totalRating') {
    return valor.toLocaleString('es-ES', { maximumFractionDigits: 2 })
  }

  if (
    clave === 'expectedGoals' ||
    clave === 'expectedAssists' ||
    clave === 'expectedGoalInvolvements' ||
    clave === 'kilometersCovered' ||
    clave === 'kilometersCoveredPer90'
  ) {
    return valor.toLocaleString('es-ES', { maximumFractionDigits: 2 })
  }

  if (clave === 'topSpeed') {
    return `${valor.toLocaleString('es-ES', {
      maximumFractionDigits: 2,
    })} km/h`
  }

  if (clave.startsWith('metersCovered')) {
    return `${Math.round(valor).toLocaleString('es-ES')} m`
  }

  if (clave === 'scoringFrequency') {
    return `${valor.toLocaleString('es-ES', {
      maximumFractionDigits: 1,
    })} min`
  }

  return valor.toLocaleString('es-ES', { maximumFractionDigits: 1 })
}

function esPortero(posicion: string | null | undefined): boolean {
  const texto = (posicion ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  return (
    texto.includes('goalkeeper') ||
    texto.includes('portero') ||
    texto === 'gk' ||
    texto === 'g'
  )
}

const CATEGORIAS_PORTERO = new Set([
  'Rendimiento general',
  'Portería',
  'Pases y creación de juego',
  'Defensa y disciplina',
  'Rendimiento físico',
])

const CATEGORIAS_CAMPO = new Set([
  'Rendimiento general',
  'Ataque y ocasiones',
  'Pases y creación de juego',
  'Regates, balón y duelos',
  'Defensa y disciplina',
  'Rendimiento físico',
])

const RESUMEN_PORTERO = [
  { nombre: 'Valoración', clave: 'rating' },
  { nombre: 'Partidos', clave: 'appearances' },
  { nombre: 'Paradas', clave: 'saves' },
  { nombre: 'Goles encajados', clave: 'goalsConceded' },
  { nombre: 'Porterías a cero', clave: 'cleanSheet' },
]

const RESUMEN_CAMPO = [
  { nombre: 'Valoración', clave: 'rating' },
  { nombre: 'Partidos', clave: 'appearances' },
  { nombre: 'Goles', clave: 'goals' },
  { nombre: 'Asistencias', clave: 'assists' },
  { nombre: 'Minutos', clave: 'minutesPlayed' },
]

function JugadorDetalle({ jugador }: JugadorDetalleProps) {
  const [temporadaId, setTemporadaId] = useState(TEMPORADA_INICIAL)
  const [temporadas, setTemporadas] = useState<Temporada[]>([
    { id: TEMPORADA_INICIAL, nombre: 'Temporada inicial' },
  ])
  const [estadisticas, setEstadisticas] =
    useState<RespuestaEstadisticas | null>(null)
  const [cargando, setCargando] = useState(true)
  const [cargandoTemporadas, setCargandoTemporadas] = useState(true)
  const [error, setError] = useState('')
  const [intentoRecarga, setIntentoRecarga] = useState(0)
  const [imagenFallida, setImagenFallida] = useState(false)

  const portero = esPortero(jugador.posicion)

  // Usamos el ID interno de EstadLiga para solicitar la imagen.
  // El Worker busca primero en R2 y recurre a Apify si hace falta.
  const tieneIdSofaScore =
    jugador.api_id != null &&
    Number.isInteger(Number(jugador.api_id)) &&
    Number(jugador.api_id) > 0

  const imagenJugador =
    tieneIdSofaScore && !imagenFallida
      ? `/api/jugadores/${jugador.id}/imagen`
      : null

  useEffect(() => {
    setImagenFallida(false)
    setTemporadaId(TEMPORADA_INICIAL)
    setEstadisticas(null)
    setError('')
  }, [jugador.id])

  useEffect(() => {
    let cancelado = false

    setCargandoTemporadas(true)

    fetch(
      `/api/jugadores/${jugador.id}/temporadas?unique_tournament_id=${TORNEO_LALIGA}`,
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar las temporadas')
        }

        return respuesta.json() as Promise<{
          temporadas: Temporada[]
        }>
      })
      .then((datos) => {
        if (cancelado || !datos.temporadas?.length) return

        const lista = [...datos.temporadas].sort((a, b) => b.id - a.id)

        setTemporadas(lista)

        const temporadaActual = lista.find((temporada) =>
          /2026|2027|actual|current/i.test(temporada.nombre),
        )

        setTemporadaId(temporadaActual?.id ?? lista[0].id)
      })
      .catch(() => {
        // Si no se pueden cargar las temporadas, se conserva la inicial.
      })
      .finally(() => {
        if (!cancelado) setCargandoTemporadas(false)
      })

    return () => {
      cancelado = true
    }
  }, [jugador.id])

  useEffect(() => {
    let cancelado = false

    setCargando(true)
    setError('')
    setEstadisticas(null)

    fetch(
      `/api/jugadores/${jugador.id}/estadisticas?unique_tournament_id=${TORNEO_LALIGA}&season_id=${temporadaId}`,
    )
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          const datos = (await respuesta.json()) as { error?: string }

          throw new Error(
            datos.error ?? 'No se pudieron cargar las estadísticas',
          )
        }

        return respuesta.json() as Promise<RespuestaEstadisticas>
      })
      .then((datos) => {
        if (!cancelado) setEstadisticas(datos)
      })
      .catch((errorConsulta: unknown) => {
        if (!cancelado) {
          setError(
            errorConsulta instanceof Error
              ? errorConsulta.message
              : 'No se pudieron cargar las estadísticas',
          )
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [jugador.id, temporadaId, intentoRecarga])

  const datosPorCategoria = useMemo(() => {
    const datos = estadisticas?.datos.statistics ?? {}

    const categoriasPermitidas = portero
      ? CATEGORIAS_PORTERO
      : CATEGORIAS_CAMPO

    return CATEGORIAS
      .filter((categoria) => categoriasPermitidas.has(categoria.titulo))
      .map((categoria) => {
        const metricas = categoria.claves
          .filter((clave) => {
            const valor = datos[clave]

            if (valor === undefined || valor === null) {
              return false
            }

            if (
              !portero &&
              categoria.titulo === 'Portería' &&
              typeof valor === 'number' &&
              valor === 0
            ) {
              return false
            }

            if (
              clave === 'savesPercentage' &&
              Number(datos.saves) <= 0
            ) {
              return false
            }

            if (
              clave === 'penaltySavePercentage' &&
              Number(datos.penaltyFaced) <= 0
            ) {
              return false
            }

            return true
          })
          .map((clave) => ({
            clave,
            nombre: formatearNombre(clave),
            valor: formatearValor(clave, datos[clave]),
          }))

        return { ...categoria, metricas }
      })
      .filter((categoria) => categoria.metricas.length > 0)
  }, [estadisticas, portero])

  const valoraciones = estadisticas?.datos.seasonRatingBreakdown
  const equipoNombre = estadisticas?.datos.team?.name ?? jugador.equipo

  return (
    <section className="seccion-contenido pagina-jugador-detalle">
      <a
        className="volver-enlace"
        href={`#/equipos/${jugador.equipo_id}`}
      >
        ← Volver al equipo
      </a>

      <header className="cabecera-jugador-detalle">
        <div className="jugador-detalle-foto">
          {imagenJugador ? (
            <img
              src={imagenJugador}
              alt={`Foto de ${jugador.nombre} ${jugador.apellido ?? ''}`}
              loading="eager"
              decoding="async"
              onError={() => setImagenFallida(true)}
            />
          ) : (
            <div
              className="jugador-foto-pendiente"
              aria-label="Foto no disponible"
            >
              <span aria-hidden="true">⚽</span>
            </div>
          )}
        </div>

        <div className="jugador-detalle-identidad">
          <span className="subtitulo">FICHA DEL JUGADOR</span>
          <h1>
            {jugador.nombre} {jugador.apellido ?? ''}
          </h1>
          <p>{equipoNombre}</p>

          <div className="jugador-detalle-etiquetas">
            <span>{jugador.posicion ?? 'Posición desconocida'}</span>
            <span>
              {jugador.nacionalidad ?? 'Nacionalidad desconocida'}
            </span>
          </div>
        </div>

        <div className="selector-temporada">
          <label htmlFor="temporada-jugador">Temporada</label>
          <select
            id="temporada-jugador"
            value={temporadaId}
            onChange={(evento) =>
              setTemporadaId(Number(evento.target.value))
            }
            disabled={cargandoTemporadas || temporadas.length === 0}
          >
            {temporadas.map((temporada) => (
              <option key={temporada.id} value={temporada.id}>
                {temporada.nombre}
              </option>
            ))}
          </select>
        </div>
      </header>

      {cargando && (
        <p className="estado-estadisticas">
          Cargando estadísticas...
        </p>
      )}

      {!cargando && error && (
        <div className="mensaje-error-estadisticas">
          <h2>No se han podido cargar las estadísticas</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setIntentoRecarga((actual) => actual + 1)}
          >
            Volver a intentar
          </button>
        </div>
      )}

      {!cargando && !error && estadisticas && (
        <>
          <div className="resumen-estadisticas-jugador">
            {(portero ? RESUMEN_PORTERO : RESUMEN_CAMPO)
              .filter((dato) => {
                const valor =
                  estadisticas.datos.statistics?.[dato.clave]

                return valor !== undefined && valor !== null
              })
              .map((dato) => {
                const valor =
                  estadisticas.datos.statistics?.[dato.clave]

                return (
                  <article
                    className="resumen-estadistica"
                    key={dato.clave}
                  >
                    <span>{dato.nombre}</span>
                    <strong>
                      {formatearValor(dato.clave, valor)}
                    </strong>
                  </article>
                )
              })}
          </div>

          {datosPorCategoria.map((categoria) => (
            <section
              className="categoria-estadisticas"
              key={categoria.titulo}
            >
              <div className="titulo-seccion">
                <div>
                  <span className="subtitulo">ESTADÍSTICAS</span>
                  <h2>{categoria.titulo}</h2>
                </div>

                <span className="contador-metricas">
                  {categoria.metricas.length} métricas
                </span>
              </div>

              <div className="rejilla-metricas">
                {categoria.metricas.map((metrica) => (
                  <article
                    className="tarjeta-metrica"
                    key={metrica.clave}
                  >
                    <span>{metrica.nombre}</span>
                    <strong>{metrica.valor}</strong>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {valoraciones && Object.keys(valoraciones).length > 0 && (
            <section className="categoria-estadisticas">
              <div className="titulo-seccion">
                <div>
                  <span className="subtitulo">RENDIMIENTO</span>
                  <h2>Desglose de valoración</h2>
                </div>
              </div>

              <div className="rejilla-metricas">
                {Object.entries(valoraciones).map(([clave, valor]) => (
                  <article className="tarjeta-metrica" key={clave}>
                    <span>
                      {NOMBRES_VALORACION[clave] ??
                        formatearNombre(clave)}
                    </span>
                    <strong>
                      {typeof valor === 'number'
                        ? valor.toLocaleString('es-ES', {
                            maximumFractionDigits: 2,
                          })
                        : '—'}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          )}

          <p className="nota-estadisticas">
            Datos proporcionados por SofaScore. Las estadísticas
            mostradas dependen de la información disponible para cada
            jugador, competición y temporada.
          </p>
        </>
      )}
    </section>
  )
}

export default JugadorDetalle
