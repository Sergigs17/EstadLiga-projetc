import { useId, useMemo, useState, type CSSProperties } from 'react'
import { coloresClub } from '../../utils/clubes'
import { EscudoClub, FotoJugador } from './PiezasJugador'
import {
  calcularEdad,
  dato,
  ETIQUETA_POSICION,
  esPorteroJugador,
  formatearNumero,
  grupoPosicion,
  maximoMinutos,
  nombreCompleto,
  porNoventa,
  type JugadorStats,
  type Stats,
} from './estadisticasJugadores'
import './ComparadorJugadores.css'

/* ───────── Colores de cada jugador ───────── */

function colorDe(j: JugadorStats): string {
  return coloresClub(j.equipo)?.acento ?? '#d4202c'
}

function distanciaColor(a: string, b: string): number {
  const rgb = (hex: string) => {
    const limpio = hex.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16))
  }
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(b)

  return Math.hypot(r1 - r2, g1 - g2, b1 - b2)
}

/* ───────── Qué se compara ───────── */

type TipoFila = 'cuenta' | 'pct' | 'nota' | 'fijo'

interface FilaComparacion {
  etiqueta: string
  valor: (s: Stats) => number | null
  tipo: TipoFila
  decimales?: number
  menorEsMejor?: boolean
  /** Las filas neutrales (minutos, partidos) no cuentan para el marcador. */
  neutral?: boolean
}

interface SeccionComparacion {
  titulo: string
  icono: string
  filas: FilaComparacion[]
}

const campo =
  (clave: string) =>
  (s: Stats): number | null =>
    dato(s, clave)

const primero =
  (...claves: string[]) =>
  (s: Stats): number | null => {
    for (const c of claves) {
      const v = dato(s, c)
      if (v !== null) return v
    }
    return null
  }

const GENERAL: SeccionComparacion = {
  titulo: 'General',
  icono: '📊',
  filas: [
    { etiqueta: 'Partidos jugados', valor: campo('appearances'), tipo: 'fijo', neutral: true },
    { etiqueta: 'Titularidades', valor: campo('matchesStarted'), tipo: 'fijo', neutral: true },
    { etiqueta: 'Minutos jugados', valor: campo('minutesPlayed'), tipo: 'fijo', neutral: true },
    { etiqueta: 'Valoración media', valor: campo('rating'), tipo: 'nota', decimales: 2 },
  ],
}

const DISCIPLINA: SeccionComparacion = {
  titulo: 'Disciplina',
  icono: '🟨',
  filas: [
    { etiqueta: 'Tarjetas amarillas', valor: campo('yellowCards'), tipo: 'cuenta', menorEsMejor: true },
    { etiqueta: 'Tarjetas rojas', valor: campo('redCards'), tipo: 'cuenta', menorEsMejor: true },
    { etiqueta: 'Faltas cometidas', valor: campo('fouls'), tipo: 'cuenta', menorEsMejor: true },
    { etiqueta: 'Faltas recibidas', valor: campo('wasFouled'), tipo: 'cuenta' },
  ],
}

const SECCIONES_CAMPO: SeccionComparacion[] = [
  GENERAL,
  {
    titulo: 'Ataque',
    icono: '⚽',
    filas: [
      { etiqueta: 'Goles', valor: campo('goals'), tipo: 'cuenta' },
      { etiqueta: 'Asistencias', valor: campo('assists'), tipo: 'cuenta' },
      {
        etiqueta: 'Goles + asistencias',
        valor: (s) => (dato(s, 'goals') ?? 0) + (dato(s, 'assists') ?? 0),
        tipo: 'cuenta',
      },
      { etiqueta: 'Goles esperados (xG)', valor: campo('expectedGoals'), tipo: 'cuenta', decimales: 1 },
      { etiqueta: 'Tiros', valor: campo('totalShots'), tipo: 'cuenta' },
      { etiqueta: 'Tiros a puerta', valor: campo('shotsOnTarget'), tipo: 'cuenta' },
      { etiqueta: 'Conversión de tiros', valor: campo('goalConversionPercentage'), tipo: 'pct' },
    ],
  },
  {
    titulo: 'Creación',
    icono: '🎯',
    filas: [
      { etiqueta: 'Pases clave', valor: campo('keyPasses'), tipo: 'cuenta' },
      { etiqueta: 'Ocasiones claras creadas', valor: campo('bigChancesCreated'), tipo: 'cuenta' },
      { etiqueta: 'Regates completados', valor: campo('successfulDribbles'), tipo: 'cuenta' },
      { etiqueta: 'Centros acertados', valor: campo('accurateCrosses'), tipo: 'cuenta' },
      { etiqueta: 'Precisión de pase', valor: campo('accuratePassesPercentage'), tipo: 'pct' },
    ],
  },
  {
    titulo: 'Defensa',
    icono: '🛡️',
    filas: [
      { etiqueta: 'Entradas ganadas', valor: primero('tacklesWon', 'tackles'), tipo: 'cuenta' },
      { etiqueta: 'Intercepciones', valor: campo('interceptions'), tipo: 'cuenta' },
      { etiqueta: 'Despejes', valor: campo('clearances'), tipo: 'cuenta' },
      { etiqueta: 'Recuperaciones', valor: campo('ballRecovery'), tipo: 'cuenta' },
      { etiqueta: 'Duelos ganados', valor: campo('totalDuelsWonPercentage'), tipo: 'pct' },
    ],
  },
  DISCIPLINA,
]

const SECCIONES_PORTEROS: SeccionComparacion[] = [
  GENERAL,
  {
    titulo: 'Portería',
    icono: '🧤',
    filas: [
      { etiqueta: 'Paradas', valor: campo('saves'), tipo: 'cuenta' },
      { etiqueta: 'Porcentaje de paradas', valor: campo('savesPercentage'), tipo: 'pct' },
      { etiqueta: 'Porterías a cero', valor: campo('cleanSheet'), tipo: 'cuenta' },
      { etiqueta: 'Goles encajados', valor: campo('goalsConceded'), tipo: 'cuenta', menorEsMejor: true },
      { etiqueta: 'Penaltis parados', valor: campo('penaltySave'), tipo: 'cuenta' },
      { etiqueta: 'Balones aéreos atrapados', valor: campo('highClaims'), tipo: 'cuenta' },
    ],
  },
  {
    titulo: 'Distribución',
    icono: '🔁',
    filas: [
      { etiqueta: 'Precisión de pase', valor: campo('accuratePassesPercentage'), tipo: 'pct' },
      { etiqueta: 'Precisión en pase largo', valor: campo('accurateLongBallsPercentage'), tipo: 'pct' },
    ],
  },
  {
    titulo: 'Disciplina',
    icono: '🟨',
    filas: DISCIPLINA.filas.slice(0, 3),
  },
]

const SECCIONES_MIXTAS: SeccionComparacion[] = [
  GENERAL,
  {
    titulo: 'Pase y duelos',
    icono: '🔁',
    filas: [
      { etiqueta: 'Precisión de pase', valor: campo('accuratePassesPercentage'), tipo: 'pct' },
      { etiqueta: 'Pases totales', valor: campo('totalPasses'), tipo: 'cuenta' },
      { etiqueta: 'Duelos ganados', valor: campo('totalDuelsWonPercentage'), tipo: 'pct' },
      { etiqueta: 'Balones recuperados', valor: campo('ballRecovery'), tipo: 'cuenta' },
    ],
  },
  DISCIPLINA,
]

/* ───────── Ejes del radar ───────── */

interface EjeRadar {
  etiqueta: string
  referencia: number
  invertido?: boolean
  valor: (s: Stats) => number | null
  texto: (v: number | null) => string
}

const fmt = (v: number | null, d = 1, sufijo = '') =>
  v === null ? '—' : `${formatearNumero(v, d)}${sufijo}`

const por90 = (clave: string, referencia: number, etiqueta: string, d = 1): EjeRadar => ({
  etiqueta,
  referencia,
  valor: (s) => porNoventa(s, clave),
  texto: (v) => fmt(v, d, '/90'),
})

function ejesPara(modo: 'campo' | 'porteros' | 'mixto', minMax: number): EjeRadar[] {
  if (modo === 'campo') {
    return [
      por90('goals', 0.7, 'Goles', 2),
      por90('assists', 0.4, 'Asistencias', 2),
      por90('totalShots', 3.5, 'Tiros'),
      por90('keyPasses', 2.5, 'Pases clave'),
      por90('successfulDribbles', 2.5, 'Regates'),
      {
        etiqueta: 'Defensa',
        referencia: 4,
        valor: (s) => {
          const a = porNoventa(s, 'tackles')
          const b = porNoventa(s, 'interceptions')
          return a === null && b === null ? null : (a ?? 0) + (b ?? 0)
        },
        texto: (v) => fmt(v, 1, '/90'),
      },
    ]
  }

  if (modo === 'porteros') {
    return [
      por90('saves', 4, 'Paradas'),
      {
        etiqueta: '% paradas',
        referencia: 80,
        valor: campo('savesPercentage'),
        texto: (v) => fmt(v, 0, '%'),
      },
      {
        etiqueta: 'A cero',
        referencia: 50,
        valor: (s) => {
          const ceros = dato(s, 'cleanSheet')
          const partidos = dato(s, 'appearances')
          return ceros === null || !partidos ? null : (ceros / partidos) * 100
        },
        texto: (v) => fmt(v, 0, '%'),
      },
      {
        etiqueta: 'Encaja poco',
        referencia: 2.5,
        invertido: true,
        valor: (s) => porNoventa(s, 'goalsConceded'),
        texto: (v) => fmt(v, 2, '/90'),
      },
      {
        etiqueta: 'Pase',
        referencia: 90,
        valor: campo('accuratePassesPercentage'),
        texto: (v) => fmt(v, 0, '%'),
      },
      por90('highClaims', 1.5, 'Juego aéreo'),
    ]
  }

  return [
    { etiqueta: 'Valoración', referencia: 8, valor: campo('rating'), texto: (v) => fmt(v, 2) },
    { etiqueta: 'Pase', referencia: 90, valor: campo('accuratePassesPercentage'), texto: (v) => fmt(v, 0, '%') },
    { etiqueta: 'Duelos', referencia: 70, valor: campo('totalDuelsWonPercentage'), texto: (v) => fmt(v, 0, '%') },
    { etiqueta: 'Minutos', referencia: Math.max(1, minMax), valor: campo('minutesPlayed'), texto: (v) => fmt(v, 0) },
    {
      etiqueta: 'Titularidad',
      referencia: 100,
      valor: (s) => {
        const t = dato(s, 'matchesStarted')
        const p = dato(s, 'appearances')
        return t === null || !p ? null : (t / p) * 100
      },
      texto: (v) => fmt(v, 0, '%'),
    },
  ]
}

/* ───────── Radar con dos jugadores ───────── */

function RadarDoble({
  ejes,
  a,
  b,
}: {
  ejes: EjeRadar[]
  a: JugadorStats
  b: JugadorStats
}) {
  const centro = 160
  const radio = 100
  const n = ejes.length

  const punto = (i: number, p: number) => {
    const angulo = (Math.PI * 2 * i) / n - Math.PI / 2
    return {
      x: centro + Math.cos(angulo) * radio * p,
      y: centro + Math.sin(angulo) * radio * p,
    }
  }

  const proporcion = (eje: EjeRadar, j: JugadorStats) => {
    const v = eje.valor(j.stats)
    if (v === null) return 0.04
    const base = eje.invertido ? 1 - v / eje.referencia : v / eje.referencia
    return Math.min(1, Math.max(0.04, base))
  }

  const poligono = (j: JugadorStats) =>
    ejes
      .map((eje, i) => {
        const { x, y } = punto(i, proporcion(eje, j))
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

  return (
    <svg
      className="cj-radar"
      viewBox="-70 -10 460 340"
      role="img"
      aria-label={`Radar comparando a ${nombreCompleto(a)} y ${nombreCompleto(b)}`}
    >
      {[0.25, 0.5, 0.75, 1].map((nivel) => (
        <polygon
          key={nivel}
          className="cj-radar-malla"
          points={ejes
            .map((_, i) => {
              const { x, y } = punto(i, nivel)
              return `${x.toFixed(1)},${y.toFixed(1)}`
            })
            .join(' ')}
        />
      ))}

      {ejes.map((_, i) => {
        const { x, y } = punto(i, 1)
        return <line key={i} className="cj-radar-eje" x1={centro} y1={centro} x2={x} y2={y} />
      })}

      <polygon className="cj-radar-area cj-radar-b" points={poligono(b)} />
      <polygon className="cj-radar-area cj-radar-a" points={poligono(a)} />

      {ejes.map((eje, i) => {
        const { x, y } = punto(i, 1.22)
        const ancla = x < centro - 8 ? 'end' : x > centro + 8 ? 'start' : 'middle'

        return (
          <g key={eje.etiqueta}>
            <text x={x} y={y - 4} textAnchor={ancla} className="cj-radar-etiqueta">
              {eje.etiqueta}
            </text>
            <text x={x} y={y + 9} textAnchor={ancla} className="cj-radar-valor">
              <tspan className="cj-tspan-a">{eje.texto(eje.valor(a.stats))}</tspan>
              <tspan className="cj-tspan-sep"> · </tspan>
              <tspan className="cj-tspan-b">{eje.texto(eje.valor(b.stats))}</tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ───────── Selector con buscador ───────── */

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function Selector({
  etiqueta,
  jugadores,
  seleccionado,
  onSeleccionar,
}: {
  etiqueta: string
  jugadores: JugadorStats[]
  seleccionado: JugadorStats | null
  onSeleccionar: (id: number) => void
}) {
  const [consulta, setConsulta] = useState('')
  const [abierto, setAbierto] = useState(false)
  const idLista = useId()

  const resultados = useMemo(() => {
    const q = normalizar(consulta)

    const lista = q
      ? jugadores.filter((j) =>
          normalizar(`${nombreCompleto(j)} ${j.equipo}`).includes(q),
        )
      : [...jugadores].sort(
          (x, y) => (dato(y.stats, 'minutesPlayed') ?? 0) - (dato(x.stats, 'minutesPlayed') ?? 0),
        )

    return lista.slice(0, 8)
  }, [consulta, jugadores])

  const elegir = (id: number) => {
    onSeleccionar(id)
    setAbierto(false)
    setConsulta('')
  }

  return (
    <div
      className="cj-selector"
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAbierto(false)
      }}
    >
      <label htmlFor={`${idLista}-entrada`}>{etiqueta}</label>

      <input
        id={`${idLista}-entrada`}
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Busca un jugador o un equipo…"
        value={abierto ? consulta : seleccionado ? nombreCompleto(seleccionado) : ''}
        onFocus={() => {
          setAbierto(true)
          setConsulta('')
        }}
        onChange={(evento) => setConsulta(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Escape') setAbierto(false)
          if (evento.key === 'Enter' && resultados[0]) {
            evento.preventDefault()
            elegir(resultados[0].id)
          }
        }}
      />

      {abierto && (
        <ul className="cj-opciones" id={idLista} role="listbox" aria-label={etiqueta}>
          {resultados.length === 0 ? (
            <li className="cj-sin-resultados">Ningún jugador coincide.</li>
          ) : (
            resultados.map((j) => (
              <li key={j.id} role="option" aria-selected={j.id === seleccionado?.id}>
                <button type="button" onClick={() => elegir(j.id)}>
                  <EscudoClub equipo={j.equipo} />
                  <span>
                    <b>{nombreCompleto(j)}</b>
                    <small>{j.equipo}</small>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

/* ───────── Tarjeta del jugador ───────── */

function TarjetaJugador({ jugador, lado }: { jugador: JugadorStats; lado: 'a' | 'b' }) {
  const edad = calcularEdad(jugador.fecha_nacimiento)
  const grupo = grupoPosicion(jugador.posicion)

  return (
    <a className={`cj-jugador cj-jugador-${lado}`} href={`#/jugadores/${jugador.id}`}>
      <FotoJugador jugador={jugador} className="cj-foto" />
      <strong>{nombreCompleto(jugador)}</strong>

      <span className="cj-equipo">
        <EscudoClub equipo={jugador.equipo} />
        {jugador.equipo}
      </span>

      <span className="cj-chips">
        {grupo && <i>{ETIQUETA_POSICION[grupo]}</i>}
        {edad !== null && <i>{edad} años</i>}
        {jugador.dorsal !== null && <i>#{jugador.dorsal}</i>}
      </span>
    </a>
  )
}

/* ───────── Valores de una fila ───────── */

function calcularValor(
  fila: FilaComparacion,
  j: JugadorStats,
  media: boolean,
): number | null {
  let v = fila.valor(j.stats)

  // Un contador que no aparece, en alguien que ha jugado, vale cero.
  if (v === null && fila.tipo === 'cuenta' && (dato(j.stats, 'minutesPlayed') ?? 0) > 0) {
    v = 0
  }

  if (v === null) return null

  if (media && fila.tipo === 'cuenta') {
    const min = dato(j.stats, 'minutesPlayed')
    return min !== null && min >= 90 ? (v / min) * 90 : null
  }

  return v
}

function decimalesFila(fila: FilaComparacion, media: boolean): number {
  if (media && fila.tipo === 'cuenta') return 2
  if (fila.tipo === 'pct') return 1
  return fila.decimales ?? 0
}

/* ───────── Comparador ───────── */

function ComparadorJugadores({ jugadores }: { jugadores: JugadorStats[] }) {
  const [idA, setIdA] = useState<number | null>(() => elegirInicial(jugadores, 0))
  const [idB, setIdB] = useState<number | null>(() => elegirInicial(jugadores, 1))
  const [media, setMedia] = useState(false)

  const a = jugadores.find((j) => j.id === idA) ?? null
  const b = jugadores.find((j) => j.id === idB) ?? null

  const minMax = useMemo(() => maximoMinutos(jugadores), [jugadores])

  const modo: 'campo' | 'porteros' | 'mixto' | null = useMemo(() => {
    if (!a || !b) return null
    const pa = esPorteroJugador(a)
    const pb = esPorteroJugador(b)
    return pa && pb ? 'porteros' : !pa && !pb ? 'campo' : 'mixto'
  }, [a, b])

  const secciones =
    modo === 'porteros'
      ? SECCIONES_PORTEROS
      : modo === 'mixto'
        ? SECCIONES_MIXTAS
        : SECCIONES_CAMPO

  const colores = useMemo(() => {
    if (!a || !b) return { a: '#d4202c', b: '#1f2937' }
    const ca = colorDe(a)
    const cb = colorDe(b)
    return { a: ca, b: distanciaColor(ca, cb) < 90 ? '#1f2937' : cb }
  }, [a, b])

  const marcador = useMemo(() => {
    let ganaA = 0
    let ganaB = 0
    let total = 0

    if (!a || !b) return { ganaA, ganaB, total }

    for (const seccion of secciones) {
      for (const fila of seccion.filas) {
        if (fila.neutral) continue
        const va = calcularValor(fila, a, media)
        const vb = calcularValor(fila, b, media)
        if (va === null || vb === null) continue

        total += 1
        if (va === vb) continue

        const aMejor = fila.menorEsMejor ? va < vb : va > vb
        if (aMejor) ganaA += 1
        else ganaB += 1
      }
    }

    return { ganaA, ganaB, total }
  }, [a, b, secciones, media])

  const estilo = {
    '--ca': colores.a,
    '--cb': colores.b,
  } as CSSProperties

  return (
    <div className="cj" style={estilo}>
      <div className="cj-selectores">
        <Selector etiqueta="Jugador 1" jugadores={jugadores} seleccionado={a} onSeleccionar={setIdA} />

        <button
          type="button"
          className="cj-intercambiar"
          onClick={() => {
            setIdA(idB)
            setIdB(idA)
          }}
          aria-label="Intercambiar jugadores"
          title="Intercambiar jugadores"
        >
          ⇄
        </button>

        <Selector etiqueta="Jugador 2" jugadores={jugadores} seleccionado={b} onSeleccionar={setIdB} />
      </div>

      {!a || !b ? (
        <p className="cj-vacio">Elige dos jugadores para ver su comparación.</p>
      ) : a.id === b.id ? (
        <p className="cj-vacio">Has elegido al mismo jugador dos veces. Elige a otro para compararlo.</p>
      ) : (
        <>
          <section className="cj-duelo" aria-label="Duelo">
            <TarjetaJugador jugador={a} lado="a" />

            <div className="cj-marcador">
              <span className="cj-vs">VS</span>
              <div className="cj-resultado" aria-label={`${marcador.ganaA} a ${marcador.ganaB}`}>
                <b className="cj-resultado-a">{marcador.ganaA}</b>
                <span>–</span>
                <b className="cj-resultado-b">{marcador.ganaB}</b>
              </div>
              <small>
                categorías ganadas
                {marcador.total > 0 && <> de {marcador.total}</>}
              </small>
            </div>

            <TarjetaJugador jugador={b} lado="b" />
          </section>

          {modo === 'mixto' && (
            <p className="cj-aviso">
              Uno es portero y el otro no, así que solo se comparan las estadísticas que tienen en común.
            </p>
          )}

          <section className="cj-radar-caja" aria-label="Gráfico de radar">
            <h3>Perfil comparado</h3>
            <p>
              {modo === 'mixto'
                ? 'Rendimiento general de ambos'
                : 'Rendimiento por 90 minutos frente a una referencia de élite'}
            </p>

            <RadarDoble ejes={ejesPara(modo ?? 'campo', minMax)} a={a} b={b} />

            <ul className="cj-leyenda">
              <li className="cj-leyenda-a">{nombreCompleto(a)}</li>
              <li className="cj-leyenda-b">{nombreCompleto(b)}</li>
            </ul>
          </section>

          <div className="cj-barra-modo" role="group" aria-label="Tipo de cifras">
            <button type="button" className={!media ? 'activo' : ''} onClick={() => setMedia(false)}>
              Totales
            </button>
            <button type="button" className={media ? 'activo' : ''} onClick={() => setMedia(true)}>
              Por 90 minutos
            </button>
          </div>

          {media && (
            <p className="cj-aviso">
              Con las cifras por 90 minutos la comparación es más justa entre jugadores con distinto tiempo en
              el campo. Quien no llega a 90 minutos jugados aparece con «—».
            </p>
          )}

          <div className="cj-secciones">
            {secciones.map((seccion) => (
              <section className="cj-seccion" key={seccion.titulo}>
                <h3>
                  <span aria-hidden="true">{seccion.icono}</span> {seccion.titulo}
                </h3>

                <div className="cj-filas">
                  {seccion.filas.map((fila) => {
                    const va = calcularValor(fila, a, media)
                    const vb = calcularValor(fila, b, media)
                    const d = decimalesFila(fila, media)
                    const unidad = fila.tipo === 'pct' ? '%' : ''
                    const maximo = Math.max(va ?? 0, vb ?? 0)

                    let ganador: 'a' | 'b' | null = null
                    if (!fila.neutral && va !== null && vb !== null && va !== vb) {
                      const aMejor = fila.menorEsMejor ? va < vb : va > vb
                      ganador = aMejor ? 'a' : 'b'
                    }

                    const ancho = (v: number | null) =>
                      maximo > 0 && v !== null ? Math.max(3, (v / maximo) * 100) : 0

                    return (
                      <div className="cj-fila" key={fila.etiqueta}>
                        <span className="cj-fila-etiqueta">{fila.etiqueta}</span>

                        <div className="cj-fila-datos">
                          <b className={`cj-valor cj-valor-a${ganador === 'a' ? ' gana' : ''}`}>
                            {fmt(va, d, unidad)}
                          </b>

                          <span className="cj-barra cj-barra-a" aria-hidden="true">
                            <i className={ganador === 'a' ? 'gana' : ganador === null ? 'igual' : ''} style={{ width: `${ancho(va)}%` }} />
                          </span>

                          <span className="cj-barra cj-barra-b" aria-hidden="true">
                            <i className={ganador === 'b' ? 'gana' : ganador === null ? 'igual' : ''} style={{ width: `${ancho(vb)}%` }} />
                          </span>

                          <b className={`cj-valor cj-valor-b${ganador === 'b' ? ' gana' : ''}`}>
                            {fmt(vb, d, unidad)}
                          </b>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Al abrir, compara a los dos máximos goleadores (o a los dos con más minutos). */
function elegirInicial(jugadores: JugadorStats[], posicion: number): number | null {
  const ordenados = [...jugadores].sort(
    (x, y) =>
      (dato(y.stats, 'goals') ?? 0) - (dato(x.stats, 'goals') ?? 0) ||
      (dato(y.stats, 'minutesPlayed') ?? 0) - (dato(x.stats, 'minutesPlayed') ?? 0),
  )

  return ordenados[posicion]?.id ?? null
}

export default ComparadorJugadores