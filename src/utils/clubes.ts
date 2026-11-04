import type { CSSProperties } from 'react'

interface ColoresClub {
  a: string // color superior del degradado
  b: string // color inferior del degradado
  acento: string // color para botones y detalles sobre blanco
}

const CLUBES: Record<string, ColoresClub> = {
  alaves: { a: '#0761af', b: '#e8f0fa', acento: '#0761af' },
  athletic: { a: '#ee2523', b: '#fbe9e9', acento: '#c4161c' },
  atlmadrid: { a: '#cb3524', b: '#272e61', acento: '#cb3524' },
  barcelona: { a: '#004d98', b: '#a50044', acento: '#a50044' },
  betis: { a: '#0bb363', b: '#f2fbf6', acento: '#0a8f4f' },
  celta: { a: '#8ac3ee', b: '#f1f8fd', acento: '#1f7ac4' },
  deportivocoruna: { a: '#0b3a8f', b: '#e9eef8', acento: '#0b3a8f' },
  elche: { a: '#0a7d3a', b: '#e9f5ee', acento: '#0a7d3a' },
  espanyol: { a: '#007fc8', b: '#e6f3fb', acento: '#007fc8' },
  getafe: { a: '#005999', b: '#e6eff6', acento: '#005999' },
  levante: { a: '#b4053f', b: '#00529f', acento: '#b4053f' },
  malaga: { a: '#2f7fd0', b: '#eaf2fb', acento: '#1d64b8' },
  osasuna: { a: '#d91a21', b: '#0a1f44', acento: '#d91a21' },
  racingsantander: { a: '#0a8a3c', b: '#e9f6ee', acento: '#0a8a3c' },
  rayovallecano: { a: '#e53027', b: '#fdecea', acento: '#e53027' },
  realmadrid: { a: '#c9a227', b: '#fbf7ea', acento: '#8a6d0b' },
  realsociedad: { a: '#0067b1', b: '#e6f0f8', acento: '#0067b1' },
  sevilla: { a: '#d4001f', b: '#fde8eb', acento: '#d4001f' },
  valencia: { a: '#f18a00', b: '#1b1b1b', acento: '#c96f00' },
  villarreal: { a: '#fbe10f', b: '#005187', acento: '#00508a' },
}

// Sin club reconocido: fondo neutro y acento rojo
const NEUTRO: ColoresClub = { a: '#f7f4f2', b: '#f7f4f2', acento: '#d4202c' }

function normalizar(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// El orden importa: "Deportivo Alavés" y "Espanyol de Barcelona"
// se comprueban antes que "deportivo" y "barcelona".
export function obtenerSlugClub(nombre: string): string | null {
  const n = normalizar(nombre)

  if (n.includes('alaves')) return 'alaves'
  if (n.includes('espanyol')) return 'espanyol'
  if (n.includes('athletic')) return 'athletic'
  if (n.includes('atletico')) return 'atlmadrid'
  if (n.includes('barcelona')) return 'barcelona'
  if (n.includes('betis')) return 'betis'
  if (n.includes('celta')) return 'celta'
  if (n.includes('deportivo') || n.includes('coruna')) return 'deportivocoruna'
  if (n.includes('elche')) return 'elche'
  if (n.includes('getafe')) return 'getafe'
  if (n.includes('levante')) return 'levante'
  if (n.includes('malaga')) return 'malaga'
  if (n.includes('osasuna')) return 'osasuna'
  if (n.includes('racing')) return 'racingsantander'
  if (n.includes('rayo')) return 'rayovallecano'
  if (n.includes('madrid')) return 'realmadrid'
  if (n.includes('sociedad')) return 'realsociedad'
  if (n.includes('sevilla')) return 'sevilla'
  if (n.includes('valencia')) return 'valencia'
  if (n.includes('villarreal')) return 'villarreal'

  return null
}

// Variables CSS que usa la ficha del club para pintar foto y degradado.
export function estilosClub(nombre?: string | null): CSSProperties {
  const slug = nombre ? obtenerSlugClub(nombre) : null
  const colores = slug ? CLUBES[slug] : NEUTRO

  return {
    '--club-a': colores.a,
    '--club-b': colores.b,
    '--club-acento': colores.acento,
    '--foto-estadio': slug ? `url('/estadios/${slug}.png')` : 'none',
  } as CSSProperties
}

// Colores de un club a partir de su nombre (para gráficos y detalles).
export function coloresClub(nombre: string): ColoresClub | null {
  const slug = obtenerSlugClub(nombre)
  return slug ? CLUBES[slug] : null
}
