/* =====================================================
   LÓGICA COMPARTIDA DE LA PÁGINA DE JUGADORES
   Tipos, utilidades y definición de las clasificaciones.
   ===================================================== */

export const TORNEO_LALIGA = 8
export const TEMPORADA_ACTUAL = 97268

export type Stats = Record<string, number>

export interface JugadorStats {
  id: number
  nombre: string
  apellido: string | null
  posicion: string | null
  nacionalidad: string | null
  fecha_nacimiento: string | null
  dorsal: number | null
  equipo_id: number | null
  api_id: number | null
  equipo: string
  stats: Stats
}

export interface RespuestaJugadoresStats {
  total: number
  actualizado_en: string | null
  jugadores: JugadorStats[]
}

/* ───────── Utilidades de jugador ───────── */

export function nombreCompleto(j: JugadorStats): string {
  return `${j.nombre} ${j.apellido ?? ''}`.trim()
}

/** Nombre corto para tablas: inicial + apellido (o el nombre si no hay). */
export function nombreCorto(j: JugadorStats): string {
  if (!j.apellido) return j.nombre
  return `${j.nombre.charAt(0)}. ${j.apellido}`
}

export function iniciales(j: JugadorStats): string {
  const a = j.nombre.charAt(0)
  const b = (j.apellido ?? j.nombre.split(' ')[1] ?? '').charAt(0)
  return `${a}${b}`.toUpperCase()
}

export function calcularEdad(fecha: string | null | undefined): number | null {
  if (!fecha) return null

  const nacimiento = new Date(fecha)
  if (Number.isNaN(nacimiento.getTime())) return null

  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const cumplido =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() >= nacimiento.getDate())

  if (!cumplido) edad -= 1

  return edad >= 0 && edad < 80 ? edad : null
}

export type GrupoPosicion = 'portero' | 'defensa' | 'medio' | 'delantero'

export function grupoPosicion(posicion: string | null): GrupoPosicion | null {
  const texto = (posicion ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (!texto) return null
  if (texto.includes('goalkeeper') || texto.includes('portero') || texto === 'g') {
    return 'portero'
  }
  if (texto.includes('defen') || texto === 'd') return 'defensa'
  if (texto.includes('midfield') || texto.includes('centrocamp') || texto === 'm') {
    return 'medio'
  }
  if (
    texto.includes('forward') ||
    texto.includes('attack') ||
    texto.includes('delantero') ||
    texto === 'f'
  ) {
    return 'delantero'
  }

  return null
}

export const ETIQUETA_POSICION: Record<GrupoPosicion, string> = {
  portero: 'Portero',
  defensa: 'Defensa',
  medio: 'Centrocampista',
  delantero: 'Delantero',
}

export function esPorteroJugador(j: JugadorStats): boolean {
  return grupoPosicion(j.posicion) === 'portero'
}

/* ───────── Formato ───────── */

export function formatearNumero(valor: number | null, decimales = 0): string {
  if (valor === null || !Number.isFinite(valor)) return '—'

  return valor.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  })
}

export function fechaCorta(fecha: string | null): string | null {
  if (!fecha) return null

  // D1 guarda "YYYY-MM-DD HH:MM:SS" en UTC.
  const d = new Date(fecha.includes('T') ? fecha : `${fecha.replace(' ', 'T')}Z`)
  if (Number.isNaN(d.getTime())) return null

  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* ───────── Cálculos sobre estadísticas ───────── */

export function dato(s: Stats, clave: string): number | null {
  const v = s[clave]
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

export function porNoventa(s: Stats, clave: string): number | null {
  const v = dato(s, clave)
  const min = dato(s, 'minutesPlayed')

  if (v === null || min === null || min < 90) return null

  return (v / min) * 90
}

/** Mayor cantidad de minutos jugados por alguien: sirve de referencia. */
export function maximoMinutos(jugadores: JugadorStats[]): number {
  return jugadores.reduce(
    (max, j) => Math.max(max, dato(j.stats, 'minutesPlayed') ?? 0),
    0,
  )
}

/* ───────── Definición de clasificaciones ───────── */

export type CategoriaId =
  | 'ataque'
  | 'creacion'
  | 'defensa'
  | 'porteria'
  | 'disciplina'
  | 'general'

export const CATEGORIAS: { id: CategoriaId; etiqueta: string; icono: string }[] = [
  { id: 'ataque', etiqueta: 'Ataque', icono: '⚽' },
  { id: 'creacion', etiqueta: 'Creación', icono: '🎯' },
  { id: 'defensa', etiqueta: 'Defensa', icono: '🛡️' },
  { id: 'porteria', etiqueta: 'Portería', icono: '🧤' },
  { id: 'disciplina', etiqueta: 'Disciplina', icono: '🟨' },
  { id: 'general', etiqueta: 'General y físico', icono: '📊' },
]

export interface ContextoRanking {
  /** Minutos mínimos para que cuenten las medias y los porcentajes. */
  minMinutos: number
}

export interface DefinicionRanking {
  id: string
  categoria: CategoriaId
  icono: string
  titulo: string
  descripcion: string
  /** Valor que se ordena. null = el jugador no entra en la clasificación. */
  valor: (j: JugadorStats, ctx: ContextoRanking) => number | null
  decimales?: number
  unidad?: string
  /** Para clasificaciones donde menos es mejor (p. ej. goles encajados). */
  menorEsMejor?: boolean
  soloPorteros?: boolean
  sinPorteros?: boolean
  /** Texto del requisito, si lo hay. */
  requisito?: (ctx: ContextoRanking) => string
}

const total =
  (...claves: string[]) =>
  (j: JugadorStats): number | null => {
    for (const clave of claves) {
      const v = dato(j.stats, clave)
      if (v !== null) return v
    }
    return null
  }

const media90 =
  (clave: string) =>
  (j: JugadorStats, ctx: ContextoRanking): number | null => {
    const min = dato(j.stats, 'minutesPlayed') ?? 0
    return min >= ctx.minMinutos ? porNoventa(j.stats, clave) : null
  }

const requisitoMinutos = (ctx: ContextoRanking) => `Mínimo ${ctx.minMinutos} min jugados`

export const RANKINGS: DefinicionRanking[] = [
  /* ───── Ataque ───── */
  {
    id: 'goleadores',
    categoria: 'ataque',
    icono: '⚽',
    titulo: 'Máximos goleadores',
    descripcion: 'Goles marcados en la temporada',
    valor: total('goals'),
  },
  {
    id: 'goles-asistencias',
    categoria: 'ataque',
    icono: '🔥',
    titulo: 'Goles + asistencias',
    descripcion: 'Participación directa en goles',
    valor: (j) =>
      dato(j.stats, 'goalsAssistsSum') ??
      ((dato(j.stats, 'goals') ?? 0) + (dato(j.stats, 'assists') ?? 0) || null),
  },
  {
    id: 'goles-90',
    categoria: 'ataque',
    icono: '⏱️',
    titulo: 'Goles por 90 minutos',
    descripcion: 'Los más letales por minuto jugado',
    valor: media90('goals'),
    decimales: 2,
    requisito: requisitoMinutos,
  },
  {
    id: 'tiros-puerta',
    categoria: 'ataque',
    icono: '🎯',
    titulo: 'Tiros a puerta',
    descripcion: 'Disparos que obligan al portero',
    valor: total('shotsOnTarget'),
  },
  {
    id: 'tiros',
    categoria: 'ataque',
    icono: '💥',
    titulo: 'Más tiros',
    descripcion: 'Total de disparos intentados',
    valor: total('totalShots'),
  },
  {
    id: 'xg',
    categoria: 'ataque',
    icono: '📈',
    titulo: 'Goles esperados (xG)',
    descripcion: 'Quien más peligro genera con sus ocasiones',
    valor: total('expectedGoals'),
    decimales: 1,
  },
  {
    id: 'conversion',
    categoria: 'ataque',
    icono: '🎰',
    titulo: 'Mejor definición',
    descripcion: 'Porcentaje de tiros que acaban en gol',
    valor: (j) =>
      (dato(j.stats, 'totalShots') ?? 0) >= 8
        ? dato(j.stats, 'goalConversionPercentage')
        : null,
    decimales: 0,
    unidad: '%',
    requisito: () => 'Mínimo 8 tiros',
  },
  {
    id: 'penaltis',
    categoria: 'ataque',
    icono: '🥅',
    titulo: 'Goles de penalti',
    descripcion: 'Los especialistas desde los once metros',
    valor: total('penaltyGoals'),
  },
  {
    id: 'cabeza',
    categoria: 'ataque',
    icono: '🤕',
    titulo: 'Goles de cabeza',
    descripcion: 'Reyes del juego aéreo en ataque',
    valor: total('headedGoals'),
  },
  {
    id: 'ocasiones-falladas',
    categoria: 'ataque',
    icono: '😬',
    titulo: 'Ocasiones claras falladas',
    descripcion: 'Los que más se lamentan frente a la portería',
    valor: total('bigChancesMissed'),
  },

  /* ───── Creación ───── */
  {
    id: 'asistentes',
    categoria: 'creacion',
    icono: '🎯',
    titulo: 'Máximos asistentes',
    descripcion: 'Pases que acaban en gol',
    valor: total('assists'),
  },
  {
    id: 'pases-clave',
    categoria: 'creacion',
    icono: '🔑',
    titulo: 'Pases clave',
    descripcion: 'Pases que acaban en un disparo',
    valor: total('keyPasses'),
  },
  {
    id: 'ocasiones-creadas',
    categoria: 'creacion',
    icono: '✨',
    titulo: 'Ocasiones claras creadas',
    descripcion: 'Los que mejor ponen el gol en bandeja',
    valor: total('bigChancesCreated'),
  },
  {
    id: 'xa',
    categoria: 'creacion',
    icono: '📈',
    titulo: 'Asistencias esperadas (xA)',
    descripcion: 'Calidad de los pases que dan',
    valor: total('expectedAssists'),
    decimales: 1,
  },
  {
    id: 'regates',
    categoria: 'creacion',
    icono: '🌀',
    titulo: 'Regates completados',
    descripcion: 'Los más difíciles de parar con balón',
    valor: total('successfulDribbles'),
  },
  {
    id: 'precision-pase',
    categoria: 'creacion',
    icono: '🧭',
    titulo: 'Precisión de pase',
    descripcion: 'Porcentaje de pases acertados',
    valor: (j) =>
      (dato(j.stats, 'totalPasses') ?? 0) >= 150
        ? dato(j.stats, 'accuratePassesPercentage')
        : null,
    decimales: 1,
    unidad: '%',
    requisito: () => 'Mínimo 150 pases',
  },
  {
    id: 'pases',
    categoria: 'creacion',
    icono: '🔁',
    titulo: 'Más pases',
    descripcion: 'Los que más mueven el balón',
    valor: total('totalPasses'),
  },
  {
    id: 'centros',
    categoria: 'creacion',
    icono: '↗️',
    titulo: 'Centros acertados',
    descripcion: 'Los mejores desde las bandas',
    valor: total('accurateCrosses'),
  },

  /* ───── Defensa ───── */
  {
    id: 'entradas',
    categoria: 'defensa',
    icono: '🦵',
    titulo: 'Entradas ganadas',
    descripcion: 'Balones robados con el pie',
    valor: total('tacklesWon', 'tackles'),
    sinPorteros: true,
  },
  {
    id: 'intercepciones',
    categoria: 'defensa',
    icono: '✋',
    titulo: 'Intercepciones',
    descripcion: 'Pases del rival cortados',
    valor: total('interceptions'),
    sinPorteros: true,
  },
  {
    id: 'despejes',
    categoria: 'defensa',
    icono: '🚀',
    titulo: 'Despejes',
    descripcion: 'Peligro quitado de en medio',
    valor: total('clearances'),
    sinPorteros: true,
  },
  {
    id: 'recuperaciones',
    categoria: 'defensa',
    icono: '🔄',
    titulo: 'Recuperaciones',
    descripcion: 'Balones recuperados para su equipo',
    valor: total('ballRecovery'),
    sinPorteros: true,
  },
  {
    id: 'duelos',
    categoria: 'defensa',
    icono: '💪',
    titulo: 'Duelos ganados',
    descripcion: 'Disputas ganadas, por tierra y aire',
    valor: total('totalDuelsWon'),
    sinPorteros: true,
  },
  {
    id: 'aereos',
    categoria: 'defensa',
    icono: '🦅',
    titulo: 'Duelos aéreos ganados',
    descripcion: 'Dueños del juego por alto',
    valor: total('aerialDuelsWon'),
    sinPorteros: true,
  },

  /* ───── Portería ───── */
  {
    id: 'paradas',
    categoria: 'porteria',
    icono: '🧤',
    titulo: 'Más paradas',
    descripcion: 'Disparos detenidos',
    valor: total('saves'),
    soloPorteros: true,
  },
  {
    id: 'porterias-cero',
    categoria: 'porteria',
    icono: '🛡️',
    titulo: 'Porterías a cero',
    descripcion: 'Partidos sin encajar',
    valor: total('cleanSheet'),
    soloPorteros: true,
  },
  {
    id: 'pct-paradas',
    categoria: 'porteria',
    icono: '🎯',
    titulo: 'Porcentaje de paradas',
    descripcion: 'De cada 100 tiros a puerta, cuántos para',
    valor: (j) =>
      (dato(j.stats, 'saves') ?? 0) >= 8 ? dato(j.stats, 'savesPercentage') : null,
    decimales: 1,
    unidad: '%',
    soloPorteros: true,
    requisito: () => 'Mínimo 8 paradas',
  },
  {
    id: 'encajados-90',
    categoria: 'porteria',
    icono: '🧱',
    titulo: 'Menos goles encajados por 90′',
    descripcion: 'Los porteros más difíciles de batir',
    valor: media90('goalsConceded'),
    decimales: 2,
    menorEsMejor: true,
    soloPorteros: true,
    requisito: requisitoMinutos,
  },
  {
    id: 'penaltis-parados',
    categoria: 'porteria',
    icono: '🥅',
    titulo: 'Penaltis parados',
    descripcion: 'Especialistas desde los once metros',
    valor: total('penaltySave'),
    soloPorteros: true,
  },
  {
    id: 'balones-aereos',
    categoria: 'porteria',
    icono: '🦅',
    titulo: 'Balones aéreos atrapados',
    descripcion: 'Dominio del área en los centros',
    valor: total('highClaims'),
    soloPorteros: true,
  },

  /* ───── Disciplina ───── */
  {
    id: 'amarillas',
    categoria: 'disciplina',
    icono: '🟨',
    titulo: 'Más tarjetas amarillas',
    descripcion: 'Los más amonestados',
    valor: total('yellowCards'),
  },
  {
    id: 'rojas',
    categoria: 'disciplina',
    icono: '🟥',
    titulo: 'Más tarjetas rojas',
    descripcion: 'Los más expulsados',
    valor: total('redCards'),
  },
  {
    id: 'faltas',
    categoria: 'disciplina',
    icono: '🚫',
    titulo: 'Faltas cometidas',
    descripcion: 'Los que más pitan en contra',
    valor: total('fouls'),
  },
  {
    id: 'faltas-recibidas',
    categoria: 'disciplina',
    icono: '🤕',
    titulo: 'Faltas recibidas',
    descripcion: 'Los más castigados por los rivales',
    valor: total('wasFouled'),
  },
  {
    id: 'fueras-juego',
    categoria: 'disciplina',
    icono: '🚩',
    titulo: 'Fueras de juego',
    descripcion: 'Los que más se pasan de la línea',
    valor: total('offsides'),
  },

  /* ───── General y físico ───── */
  {
    id: 'valoracion',
    categoria: 'general',
    icono: '⭐',
    titulo: 'Mejor valoración media',
    descripcion: 'Nota media por partido',
    valor: (j, ctx) =>
      (dato(j.stats, 'minutesPlayed') ?? 0) >= ctx.minMinutos
        ? dato(j.stats, 'rating')
        : null,
    decimales: 2,
    requisito: requisitoMinutos,
  },
  {
    id: 'minutos',
    categoria: 'general',
    icono: '⏳',
    titulo: 'Más minutos jugados',
    descripcion: 'Los incombustibles',
    valor: total('minutesPlayed'),
    unidad: ' min',
  },
  {
    id: 'partidos',
    categoria: 'general',
    icono: '📅',
    titulo: 'Más partidos jugados',
    descripcion: 'Presencia en la competición',
    valor: total('appearances'),
  },
  {
    id: 'titularidades',
    categoria: 'general',
    icono: '👕',
    titulo: 'Más titularidades',
    descripcion: 'Los intocables del once',
    valor: total('matchesStarted'),
  },
  {
    id: 'km',
    categoria: 'general',
    icono: '🏃',
    titulo: 'Más kilómetros recorridos',
    descripcion: 'Distancia total en la temporada',
    valor: total('kilometersCovered'),
    decimales: 1,
    unidad: ' km',
  },
  {
    id: 'velocidad',
    categoria: 'general',
    icono: '⚡',
    titulo: 'Velocidad máxima',
    descripcion: 'El pico de velocidad más alto registrado',
    valor: total('topSpeed'),
    decimales: 1,
    unidad: ' km/h',
  },
  {
    id: 'esprints',
    categoria: 'general',
    icono: '💨',
    titulo: 'Más esprints',
    descripcion: 'Arrancadas a máxima velocidad',
    valor: total('numberOfSprints'),
  },
]

/* ───────── Construcción de una clasificación ───────── */

export interface FilaRanking {
  jugador: JugadorStats
  valor: number
  /** Posición con empates (dos primeros = 1.º y 1.º, el siguiente 3.º). */
  puesto: number
}

export function construirRanking(
  def: DefinicionRanking,
  jugadores: JugadorStats[],
  ctx: ContextoRanking,
): FilaRanking[] {
  const candidatos = jugadores
    .filter((j) => {
      if (def.soloPorteros && !esPorteroJugador(j)) return false
      if (def.sinPorteros && esPorteroJugador(j)) return false
      return true
    })
    .flatMap((jugador) => {
      const valor = def.valor(jugador, ctx)
      // Los valores a cero no son un logro (0 goles, 0 rojas...).
      return valor === null || !Number.isFinite(valor) || valor <= 0
        ? []
        : [{ jugador, valor }]
    })

  candidatos.sort((a, b) => {
    const diferencia = def.menorEsMejor ? a.valor - b.valor : b.valor - a.valor
    if (diferencia !== 0) return diferencia

    // Empate: gana quien lo ha conseguido en menos minutos.
    const minA = dato(a.jugador.stats, 'minutesPlayed') ?? 0
    const minB = dato(b.jugador.stats, 'minutesPlayed') ?? 0
    if (minA !== minB) return minA - minB

    return nombreCompleto(a.jugador).localeCompare(nombreCompleto(b.jugador), 'es')
  })

  let puestoActual = 1

  return candidatos.map((c, indice) => {
    if (indice > 0 && c.valor !== candidatos[indice - 1].valor) {
      puestoActual = indice + 1
    }

    return { ...c, puesto: puestoActual }
  })
}

export function textoValor(def: DefinicionRanking, valor: number): string {
  return `${formatearNumero(valor, def.decimales ?? 0)}${def.unidad ?? ''}`
}