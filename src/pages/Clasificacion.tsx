import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './Clasificacion.css'
import { coloresClub } from '../utils/clubes'

/* ───────── Tipos ───────── */

interface EquipoClasificacion {
  id: number
  nombre: string
  abreviatura: string
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
        tla?: string
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

interface Partido {
  jornada: number | null
  estado: string
  fecha: string
  local: number
  visitante: number
  golesLocal: number | null
  golesVisitante: number | null
}

interface PartidoJugado extends Partido {
  jornada: number
  golesLocal: number
  golesVisitante: number
}

interface RespuestaPartidos {
  partidos?: Partido[]
}

type Resultado = 'V' | 'E' | 'D'

interface ResultadoForma {
  resultado: Resultado
  texto: string
}

interface PuntoEvolucion {
  posicion: number
  puntos: number
}

interface Evolucion {
  jornadas: number[]
  series: Map<number, PuntoEvolucion[]>
}

/* ───────── Zonas de la tabla ─────────
   Cambia aquí los puestos si la normativa varía (por ejemplo, si el
   campeón de Copa ya tiene plaza europea, la Conference baja al 7.º). */

type IdZona = 'champions' | 'europa' | 'conference' | 'descenso'

interface Zona {
  id: IdZona
  nombre: string
  desde: number
  hasta: number
  color: string
}

const PLAZAS_DESCENSO = 3

const ZONAS: Zona[] = [
  { id: 'champions', nombre: 'Champions League', desde: 1, hasta: 4, color: '#1e5fd8' },
  { id: 'europa', nombre: 'Europa League', desde: 5, hasta: 5, color: '#f28c1b' },
  { id: 'conference', nombre: 'Conference League', desde: 6, hasta: 6, color: '#14a35a' },
  { id: 'descenso', nombre: 'Descenso', desde: 0, hasta: 0, color: '#d4202c' },
]

function zonaDe(posicion: number, total: number): Zona | null {
  if (posicion > total - PLAZAS_DESCENSO) return ZONAS[3]

  return (
    ZONAS.find(
      (zona) =>
        zona.id !== 'descenso' &&
        posicion >= zona.desde &&
        posicion <= zona.hasta,
    ) ?? null
  )
}

function rangoZona(zona: Zona, total: number): string {
  if (zona.id === 'descenso') {
    return `${total - PLAZAS_DESCENSO + 1}.º–${total}.º`
  }

  return zona.desde === zona.hasta
    ? `${zona.desde}.º`
    : `${zona.desde}.º–${zona.hasta}.º`
}

/* ───────── Utilidades ───────── */

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
    'Ã': 'Í',
    'Ã“': 'Ó',
    'Ãš': 'Ú',
    'Ã‘': 'Ñ',
    'Ã§': 'ç',
    'Ã ': 'à',
  }

  return texto.replace(
    /Ã¡|Ã©|Ã­|Ã³|Ãº|Ã±|Ã¼|Ã€|Ã‰|Ã|Ã“|Ãš|Ã‘|Ã§|Ã /g,
    (caracter) => errores[caracter] ?? caracter,
  )
}

function esJugado(partido: Partido): partido is PartidoJugado {
  return (
    partido.estado === 'FINISHED' &&
    partido.jornada !== null &&
    partido.golesLocal !== null &&
    partido.golesVisitante !== null
  )
}

function ordenarTabla(
  a: { id: number; pts: number; gf: number; gc: number },
  b: { id: number; pts: number; gf: number; gc: number },
): number {
  return (
    b.pts - a.pts ||
    b.gf - b.gc - (a.gf - a.gc) ||
    b.gf - a.gf ||
    a.id - b.id
  )
}

/** Últimos cinco resultados de cada equipo. */
function calcularForma(
  partidos: Partido[],
  equipos: EquipoClasificacion[],
): Map<number, ResultadoForma[]> {
  const abreviaturas = new Map(equipos.map((e) => [e.id, e.abreviatura]))
  const forma = new Map<number, ResultadoForma[]>()

  const registrar = (
    equipoId: number,
    propios: number,
    rivales: number,
    jornada: number,
    rivalId: number,
  ) => {
    const resultado: Resultado =
      propios > rivales ? 'V' : propios < rivales ? 'D' : 'E'
    const lista = forma.get(equipoId) ?? []

    lista.push({
      resultado,
      texto: `J${jornada}: ${propios}-${rivales} vs ${abreviaturas.get(rivalId) ?? '?'}`,
    })
    forma.set(equipoId, lista)
  }

  partidos
    .filter(esJugado)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .forEach((p) => {
      registrar(p.local, p.golesLocal, p.golesVisitante, p.jornada, p.visitante)
      registrar(p.visitante, p.golesVisitante, p.golesLocal, p.jornada, p.local)
    })

  forma.forEach((lista, id) => forma.set(id, lista.slice(-5)))
  return forma
}

/** Posición y puntos de cada equipo tras cada jornada. */
function calcularEvolucion(
  equipos: EquipoClasificacion[],
  partidos: Partido[],
): Evolucion | null {
  const jugados = partidos.filter(esJugado)
  if (jugados.length === 0 || equipos.length === 0) return null

  const ultima = Math.max(...jugados.map((p) => p.jornada))
  const porJornada = new Map<number, PartidoJugado[]>()

  jugados.forEach((p) => {
    const lista = porJornada.get(p.jornada) ?? []
    lista.push(p)
    porJornada.set(p.jornada, lista)
  })

  const acumulado = new Map(
    equipos.map((e) => [e.id, { id: e.id, pts: 0, gf: 0, gc: 0 }]),
  )
  const series = new Map<number, PuntoEvolucion[]>(
    equipos.map((e) => [e.id, []]),
  )

  const sumar = (id: number, propios: number, rivales: number) => {
    const fila = acumulado.get(id)
    if (!fila) return
    fila.gf += propios
    fila.gc += rivales
    fila.pts += propios > rivales ? 3 : propios === rivales ? 1 : 0
  }

  const jornadas: number[] = []

  for (let j = 1; j <= ultima; j++) {
    jornadas.push(j)

    ;(porJornada.get(j) ?? []).forEach((p) => {
      sumar(p.local, p.golesLocal, p.golesVisitante)
      sumar(p.visitante, p.golesVisitante, p.golesLocal)
    })

    Array.from(acumulado.values())
      .sort(ordenarTabla)
      .forEach((fila, indice) => {
        series.get(fila.id)?.push({ posicion: indice + 1, puntos: fila.pts })
      })
  }

  return { jornadas, series }
}

/* ───────── Colores de las líneas ───────── */

const COLOR_NEUTRO = '#6b6460'
const TRAZOS = ['', '9 5', '2 4', '12 4 2 4']

function matiz(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  if (d === 0) return 0

  const h =
    max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  const grados = h * 60

  return grados < 0 ? grados + 360 : grados
}

function familiaColor(hex: string): string {
  const h = matiz(hex)

  if (h < 25 || h >= 340) return 'rojo'
  if (h < 70) return 'naranja'
  if (h < 100) return 'amarillo'
  if (h < 170) return 'verde'
  if (h < 260) return 'azul'
  return 'morado'
}

interface EstiloLinea {
  color: string
  trazo: string
}

/** Cada equipo usa los colores de su club; si se parecen, cambia el trazo. */
function crearEstilos(equipos: EquipoClasificacion[]): Map<number, EstiloLinea> {
  const usados = new Map<string, number>()
  const estilos = new Map<number, EstiloLinea>()

  equipos.forEach((equipo) => {
    const color = coloresClub(equipo.nombre)?.a ?? COLOR_NEUTRO
    const familia = familiaColor(color)
    const n = usados.get(familia) ?? 0

    usados.set(familia, n + 1)
    estilos.set(equipo.id, { color, trazo: TRAZOS[n % TRAZOS.length] })
  })

  return estilos
}

/* ───────── Gráfico de evolución ───────── */

const ANCHO = 1000
const ALTO = 560
const MARGEN = { izq: 48, der: 118, arriba: 22, abajo: 44 }

type ModoGrafico = 'posicion' | 'puntos'

function separarEtiquetas(
  elementos: { id: number; y: number }[],
  separacion: number,
  minimo: number,
  maximo: number,
): Map<number, number> {
  const orden = elementos.map((e) => ({ ...e })).sort((a, b) => a.y - b.y)

  for (let i = 0; i < orden.length; i++) {
    orden[i].y = Math.max(orden[i].y, i === 0 ? minimo : orden[i - 1].y + separacion)
  }

  const ultimo = orden.length - 1
  if (ultimo >= 0 && orden[ultimo].y > maximo) {
    orden[ultimo].y = maximo
    for (let i = ultimo - 1; i >= 0; i--) {
      orden[i].y = Math.min(orden[i].y, orden[i + 1].y - separacion)
    }
  }

  return new Map(orden.map((e) => [e.id, e.y]))
}

interface GraficoEvolucionProps {
  equipos: EquipoClasificacion[]
  evolucion: Evolucion
}

function GraficoEvolucion({ equipos, evolucion }: GraficoEvolucionProps) {
  const [modo, setModo] = useState<ModoGrafico>('posicion')
  const [ocultos, setOcultos] = useState<Set<number>>(new Set())
  const [resaltado, setResaltado] = useState<number | null>(null)

  const estilos = useMemo(() => crearEstilos(equipos), [equipos])

  const total = equipos.length
  const jornadas = evolucion.jornadas.length
  const anchoUtil = ANCHO - MARGEN.izq - MARGEN.der
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo

  const maximoPuntos = useMemo(() => {
    let maximo = 0
    evolucion.series.forEach((serie) => {
      serie.forEach((punto) => {
        maximo = Math.max(maximo, punto.puntos)
      })
    })
    return Math.max(6, Math.ceil(maximo / 3) * 3)
  }, [evolucion])

  const x = (jornada: number) =>
    jornadas === 1
      ? MARGEN.izq + anchoUtil / 2
      : MARGEN.izq + ((jornada - 1) / (jornadas - 1)) * anchoUtil

  const yPosicion = (posicion: number) =>
    MARGEN.arriba + ((posicion - 1) / Math.max(1, total - 1)) * altoUtil

  const yPuntos = (puntos: number) =>
    MARGEN.arriba + altoUtil - (puntos / maximoPuntos) * altoUtil

  const y = (punto: PuntoEvolucion) =>
    modo === 'posicion' ? yPosicion(punto.posicion) : yPuntos(punto.puntos)

  const paso = altoUtil / Math.max(1, total - 1)
  const visibles = equipos.filter((e) => !ocultos.has(e.id))

  const etiquetasY = useMemo(() => {
    const finales = visibles.map((equipo) => {
      const serie = evolucion.series.get(equipo.id) ?? []
      const ultimo = serie[serie.length - 1]
      return { id: equipo.id, y: ultimo ? y(ultimo) : 0 }
    })

    return separarEtiquetas(
      finales,
      19,
      MARGEN.arriba,
      ALTO - MARGEN.abajo,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibles.length, ocultos, modo, evolucion])

  const ordenActual = [...equipos].sort((a, b) => a.posicion - b.posicion)

  const alternar = (id: number) => {
    setOcultos((anteriores) => {
      const nuevos = new Set(anteriores)
      if (nuevos.has(id)) nuevos.delete(id)
      else nuevos.add(id)
      return nuevos
    })
  }

  const soloZona = (zona: Zona) => {
    setOcultos(
      new Set(
        equipos
          .filter((e) => zonaDe(e.posicion, total)?.id !== zona.id)
          .map((e) => e.id),
      ),
    )
  }

  const paraDibujar = [...visibles].sort((a, b) =>
    a.id === resaltado ? 1 : b.id === resaltado ? -1 : 0,
  )

  const marcasPuntos: number[] = []
  const salto = maximoPuntos <= 15 ? 3 : maximoPuntos <= 45 ? 6 : 10
  for (let p = 0; p <= maximoPuntos; p += salto) marcasPuntos.push(p)

  const cadaCuantas = jornadas <= 12 ? 1 : jornadas <= 24 ? 2 : 4
  const nombreModo = modo === 'posicion' ? 'Posición' : 'Puntos'

  return (
    <div className="evolucion-contenido">
      <div className="evolucion-controles">
        <div className="evolucion-pestanas" role="tablist" aria-label="Tipo de gráfico">
          {(['posicion', 'puntos'] as ModoGrafico[]).map((valor) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={modo === valor}
              className={modo === valor ? 'activo' : ''}
              onClick={() => setModo(valor)}
            >
              {valor === 'posicion' ? 'Posición por jornada' : 'Puntos por jornada'}
            </button>
          ))}
        </div>

        <div className="evolucion-atajos">
          <button type="button" onClick={() => setOcultos(new Set())}>
            Mostrar todos
          </button>
          <button
            type="button"
            onClick={() => setOcultos(new Set(equipos.map((e) => e.id)))}
          >
            Ocultar todos
          </button>
          <button type="button" onClick={() => soloZona(ZONAS[0])}>
            Solo Champions
          </button>
          <button type="button" onClick={() => soloZona(ZONAS[3])}>
            Solo descenso
          </button>
        </div>
      </div>

      <div className="evolucion-lienzo">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          role="img"
          aria-label={`Gráfico de ${nombreModo.toLowerCase()} de cada equipo tras cada jornada`}
          onMouseLeave={() => setResaltado(null)}
        >
          {/* Zonas de la tabla en el fondo */}
          {modo === 'posicion' &&
            ZONAS.map((zona) => {
              const desde = zona.id === 'descenso' ? total - PLAZAS_DESCENSO + 1 : zona.desde
              const hasta = zona.id === 'descenso' ? total : zona.hasta
              const arriba = yPosicion(desde) - paso / 2
              const abajo = yPosicion(hasta) + paso / 2

              return (
                <g key={zona.id}>
                  <rect
                    x={MARGEN.izq}
                    y={arriba}
                    width={anchoUtil}
                    height={abajo - arriba}
                    fill={zona.color}
                    opacity={0.09}
                  />
                  <rect
                    x={MARGEN.izq - 9}
                    y={arriba + 1}
                    width={4}
                    height={abajo - arriba - 2}
                    rx={2}
                    fill={zona.color}
                  />
                </g>
              )
            })}

          {/* Líneas guía y ejes */}
          {modo === 'posicion'
            ? Array.from({ length: total }, (_, i) => i + 1).map((posicion) => (
                <g key={posicion}>
                  <line
                    x1={MARGEN.izq}
                    x2={ANCHO - MARGEN.der}
                    y1={yPosicion(posicion)}
                    y2={yPosicion(posicion)}
                    className="evolucion-guia"
                  />
                  <text x={MARGEN.izq - 18} y={yPosicion(posicion) + 4} className="evolucion-eje" textAnchor="end">
                    {posicion}
                  </text>
                </g>
              ))
            : marcasPuntos.map((puntos) => (
                <g key={puntos}>
                  <line
                    x1={MARGEN.izq}
                    x2={ANCHO - MARGEN.der}
                    y1={yPuntos(puntos)}
                    y2={yPuntos(puntos)}
                    className="evolucion-guia"
                  />
                  <text x={MARGEN.izq - 10} y={yPuntos(puntos) + 4} className="evolucion-eje" textAnchor="end">
                    {puntos}
                  </text>
                </g>
              ))}

          {evolucion.jornadas
            .filter((j) => j === 1 || j % cadaCuantas === 0 || j === jornadas)
            .map((j) => (
              <text key={j} x={x(j)} y={ALTO - 16} className="evolucion-eje" textAnchor="middle">
                J{j}
              </text>
            ))}

          {/* Líneas de los equipos */}
          {paraDibujar.map((equipo) => {
            const serie = evolucion.series.get(equipo.id) ?? []
            const estilo = estilos.get(equipo.id)
            if (serie.length === 0 || !estilo) return null

            const activo = resaltado === equipo.id
            const apagado = resaltado !== null && !activo
            const camino = serie
              .map((punto, i) => `${i === 0 ? 'M' : 'L'}${x(i + 1).toFixed(1)},${y(punto).toFixed(1)}`)
              .join(' ')
            const ultimo = serie[serie.length - 1]

            return (
              <g key={equipo.id} className="evolucion-equipo">
                <path
                  d={camino}
                  fill="none"
                  stroke={estilo.color}
                  strokeWidth={activo ? 5 : 2.6}
                  strokeDasharray={estilo.trazo || undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={apagado ? 0.12 : 1}
                />
                {activo &&
                  serie.map((punto, i) => (
                    <circle key={i} cx={x(i + 1)} cy={y(punto)} r={4.5} fill="#fff" stroke={estilo.color} strokeWidth={2.5}>
                      <title>
                        {`${equipo.nombre} · J${i + 1}: ${punto.posicion}.º (${punto.puntos} pts)`}
                      </title>
                    </circle>
                  ))}
                {/* Zona sensible para el ratón */}
                <path
                  d={camino}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  onMouseEnter={() => setResaltado(equipo.id)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Escudo y abreviatura al final de la línea */}
                {ultimo && (
                  <g
                    opacity={apagado ? 0.25 : 1}
                    onMouseEnter={() => setResaltado(equipo.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x(jornadas)}
                      cy={y(ultimo)}
                      r={4}
                      fill={estilo.color}
                    />
                    <line
                      x1={x(jornadas) + 4}
                      y1={y(ultimo)}
                      x2={ANCHO - MARGEN.der + 14}
                      y2={etiquetasY.get(equipo.id) ?? y(ultimo)}
                      stroke={estilo.color}
                      strokeWidth={1}
                      opacity={0.5}
                    />
                    <image
                      href={equipo.escudo}
                      x={ANCHO - MARGEN.der + 16}
                      y={(etiquetasY.get(equipo.id) ?? y(ultimo)) - 9}
                      width={18}
                      height={18}
                    />
                    <text
                      x={ANCHO - MARGEN.der + 40}
                      y={(etiquetasY.get(equipo.id) ?? y(ultimo)) + 4}
                      className="evolucion-etiqueta"
                      fill={activo ? estilo.color : undefined}
                    >
                      {equipo.abreviatura}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Leyenda: pulsa para mostrar u ocultar equipos */}
      <ul className="evolucion-leyenda" aria-label="Equipos del gráfico">
        {ordenActual.map((equipo) => {
          const estilo = estilos.get(equipo.id)
          const oculto = ocultos.has(equipo.id)

          return (
            <li key={equipo.id}>
              <button
                type="button"
                className={oculto ? 'oculto' : ''}
                aria-pressed={!oculto}
                onClick={() => alternar(equipo.id)}
                onMouseEnter={() => !oculto && setResaltado(equipo.id)}
                onMouseLeave={() => setResaltado(null)}
                onFocus={() => !oculto && setResaltado(equipo.id)}
                onBlur={() => setResaltado(null)}
              >
                <span
                  className="leyenda-color"
                  style={{ background: estilo?.color ?? COLOR_NEUTRO }}
                  aria-hidden="true"
                />
                <img src={equipo.escudo} alt="" loading="lazy" />
                <span>{equipo.nombre.replace(/^(RCD?|CA|FC|UD|CD|RC) /, '')}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="evolucion-nota">
        Pulsa un equipo para mostrarlo u ocultarlo y pasa el ratón por una
        línea para resaltarla. No se tienen en cuenta sanciones ni deducciones
        de puntos.
      </p>
    </div>
  )
}

/* ───────── Página ───────── */

function Clasificacion() {
  const [equipos, setEquipos] = useState<EquipoClasificacion[]>([])
  const [partidos, setPartidos] = useState<Partido[] | null>(null)
  const [jornada, setJornada] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorPartidos, setErrorPartidos] = useState(false)
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

        const equiposTransformados = tabla.map((fila) => {
          const nombre = repararTexto(fila.team.name)

          return {
            id: fila.team.id,
            nombre,
            abreviatura: (
              fila.team.tla ?? nombre.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '').slice(0, 3)
            ).toUpperCase(),
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
          }
        })

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

    // Los resultados son opcionales: sin ellos la tabla se ve igual.
    async function cargarPartidos() {
      try {
        setErrorPartidos(false)

        const respuesta = await fetch('/api/partidos', {
          signal: controlador.signal,
        })

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los partidos.')
        }

        const datos: RespuestaPartidos = await respuesta.json()
        setPartidos(datos.partidos ?? [])
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setErrorPartidos(true)
      }
    }

    void cargarClasificacion()
    void cargarPartidos()

    return () => controlador.abort()
  }, [])

  const total = equipos.length
  const maximoPuntos = Math.max(1, ...equipos.map((e) => e.puntos))

  const forma = useMemo(
    () => (partidos ? calcularForma(partidos, equipos) : null),
    [partidos, equipos],
  )

  const evolucion = useMemo(
    () => (partidos ? calcularEvolucion(equipos, partidos) : null),
    [partidos, equipos],
  )

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
            <span className="etiqueta-jornada">Jornada {jornada}</span>
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
          <>
            <ul className="zonas-leyenda" aria-label="Zonas de la clasificación">
              {ZONAS.map((zona) => (
                <li key={zona.id} style={{ '--zona': zona.color } as CSSProperties}>
                  <span className="zona-punto" aria-hidden="true" />
                  <strong>{zona.nombre}</strong>
                  <span>{rangoZona(zona, total)}</span>
                </li>
              ))}
            </ul>

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
                    {forma && <th scope="col" title="Últimos cinco partidos">Forma</th>}
                  </tr>
                </thead>

                <tbody>
                  {equipos.map((equipo) => {
                    const zona = zonaDe(equipo.posicion, total)
                    const ultimos = forma?.get(equipo.id) ?? []

                    return (
                      <tr
                        key={equipo.id}
                        className={zona ? `con-zona zona-${zona.id}` : ''}
                        style={zona ? ({ '--zona': zona.color } as CSSProperties) : undefined}
                      >
                        <td className="posicion-equipo">
                          <span
                            className="insignia-posicion"
                            title={zona?.nombre}
                          >
                            {equipo.posicion}
                          </span>
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
                        <td
                          className={
                            equipo.diferenciaGoles > 0
                              ? 'dg-positiva'
                              : equipo.diferenciaGoles < 0
                                ? 'dg-negativa'
                                : ''
                          }
                        >
                          {equipo.diferenciaGoles > 0
                            ? `+${equipo.diferenciaGoles}`
                            : equipo.diferenciaGoles}
                        </td>

                        <td className="puntos-equipo">
                          <strong>{equipo.puntos}</strong>
                          <span className="barra-puntos" aria-hidden="true">
                            <i style={{ width: `${(equipo.puntos / maximoPuntos) * 100}%` }} />
                          </span>
                        </td>

                        {forma && (
                          <td>
                            <span className="forma-equipo">
                              {ultimos.length === 0 && '—'}
                              {ultimos.map((r, i) => (
                                <i
                                  key={i}
                                  className={`forma-${r.resultado}`}
                                  title={r.texto}
                                >
                                  {r.resultado}
                                </i>
                              ))}
                            </span>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="zonas-nota">
              Las plazas europeas pueden cambiar según la Copa del Rey y el
              coeficiente UEFA.
            </p>
          </>
        )}
      </div>

      <div className="clasificacion-evolucion">
        <div className="clasificacion-cabecera">
          <div>
            <h3>Evolución de la temporada</h3>
            <p>
              Cómo han cambiado la posición y los puntos de cada equipo a lo
              largo de las jornadas.
            </p>
          </div>
        </div>

        {errorPartidos && (
          <div className="clasificacion-mensaje" role="status">
            No se han podido cargar los resultados de las jornadas. Inténtalo
            de nuevo más tarde.
          </div>
        )}

        {!errorPartidos && !partidos && !cargando && !error && (
          <div className="clasificacion-mensaje">Cargando resultados...</div>
        )}

        {!errorPartidos && partidos && !evolucion && (
          <div className="clasificacion-mensaje">
            Todavía no hay jornadas jugadas para dibujar el gráfico.
          </div>
        )}

        {evolucion && !error && equipos.length > 0 && (
          <GraficoEvolucion equipos={equipos} evolucion={evolucion} />
        )}
      </div>
    </section>
  )
}

export default Clasificacion
