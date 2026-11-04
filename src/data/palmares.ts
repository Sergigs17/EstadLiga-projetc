/* =====================================================
   PALMARÉS DE LOS CLUBES
   =====================================================

   Las imágenes y la historia de cada trofeo están en src/data/trofeos.ts.
   Aquí se apunta CUÁNTOS títulos tiene cada club en esas competiciones.

   Datos comprobados con RFEF, LaLiga, UEFA, Wikipedia, RSSSF y prensa
   deportiva. Actualizado hasta agosto de 2026 (incluye la temporada 2025-26
   y la Supercopa de Europa 2026).

   CÓMO AÑADIR O CORREGIR UN TÍTULO
   Cada línea es:   trofeo('competición', número_de_títulos, 'nota opcional')

       barcelona: [
         trofeo('liga', 29),
         trofeo('champions', 5),
       ],

   Si cambia algo (por ejemplo, el club gana otra Copa), solo hay que subir
   el número de esa línea. Si el club gana un título nuevo, se añade otra línea.

   COMPETICIONES DISPONIBLES
     liga · copa · supercopa · champions · europa · conference
     supercopaEuropa · mundialClubes · intercontinental · recopa
     ferias · intertoto · latina · evaDuarte · copaLiga
     iberoamericana · intercontinentalHistorica

   Nota: «europa» recoge la Copa de la UEFA y la Europa League juntas.
   ===================================================== */

import type { ClaveTrofeo } from './trofeos'

export const PALMARES_ACTUALIZADO = 'agosto de 2026'

export interface TrofeoClub {
  clave: ClaveTrofeo
  /** null = todavía sin verificar. */
  cantidad: number | null
  /** Nota o años (opcional). */
  anios?: string
}

export type CarpetaClub =
  | 'alaves'
  | 'athletic'
  | 'atlmadrid'
  | 'barcelona'
  | 'betis'
  | 'celta'
  | 'deportivocoruna'
  | 'elche'
  | 'espanyol'
  | 'getafe'
  | 'levante'
  | 'malaga'
  | 'osasuna'
  | 'racingsantander'
  | 'rayovallecano'
  | 'realmadrid'
  | 'realsociedad'
  | 'sevilla'
  | 'valencia'
  | 'villarreal'

export function trofeo(
  clave: ClaveTrofeo,
  cantidad: number | null,
  anios?: string,
): TrofeoClub {
  return { clave, cantidad, anios }
}

export const PALMARES: Record<CarpetaClub, TrofeoClub[]> = {
  /* Sin títulos en las competiciones de esta página */
  alaves: [],
  celta: [],
  elche: [],
  getafe: [],
  levante: [],
  osasuna: [],
  racingsantander: [],
  rayovallecano: [],

  athletic: [
    trofeo('liga', 8),
    trofeo(
      'copa',
      24,
      'Cifra de la RFEF. Algunas fuentes suman la Copa de la Coronación de 1902 y la elevan a 25',
    ),
    trofeo('supercopa', 3),
    trofeo('evaDuarte', 1),
  ],

  atlmadrid: [
    trofeo('liga', 11),
    trofeo('copa', 10),
    trofeo('supercopa', 2),
    trofeo('europa', 3),
    trofeo('supercopaEuropa', 3),
    trofeo('recopa', 1),
    trofeo('intercontinentalHistorica', 1),
    trofeo('evaDuarte', 1),
  ],

  barcelona: [
    trofeo('liga', 29),
    trofeo('copa', 32),
    trofeo('supercopa', 16),
    trofeo('champions', 5),
    trofeo('supercopaEuropa', 5),
    trofeo('recopa', 4),
    trofeo('ferias', 3),
    trofeo('mundialClubes', 3),
    trofeo('latina', 2),
    trofeo('copaLiga', 2),
    trofeo('evaDuarte', 3),
  ],

  betis: [trofeo('liga', 1), trofeo('copa', 3)],

  deportivocoruna: [trofeo('liga', 1), trofeo('copa', 2), trofeo('supercopa', 3)],

  espanyol: [trofeo('copa', 4)],

  malaga: [trofeo('intertoto', 1)],

  realmadrid: [
    trofeo('liga', 36),
    trofeo('copa', 20),
    trofeo('supercopa', 13),
    trofeo('champions', 15),
    trofeo('europa', 2, 'Ganadas con el nombre de Copa de la UEFA (1985 y 1986)'),
    trofeo('supercopaEuropa', 6),
    trofeo('mundialClubes', 5),
    trofeo('intercontinental', 1),
    trofeo('intercontinentalHistorica', 3),
    trofeo('latina', 2),
    trofeo('copaLiga', 1),
    trofeo('iberoamericana', 1),
    trofeo('evaDuarte', 1, 'El club no la incluye en su palmarés oficial'),
  ],

  realsociedad: [
    trofeo('liga', 2),
    trofeo(
      'copa',
      4,
      'Cuenta la de 1909, ganada como Club Ciclista. Otras fuentes la excluyen y dan 3',
    ),
    trofeo('supercopa', 1),
  ],

  sevilla: [
    trofeo('liga', 1),
    trofeo('copa', 5),
    trofeo('supercopa', 1),
    trofeo('europa', 7, 'Incluye la Copa de la UEFA (2006 y 2007) y la Europa League'),
    trofeo('supercopaEuropa', 1),
  ],

  valencia: [
    trofeo('liga', 6),
    trofeo('copa', 8),
    trofeo('supercopa', 1),
    trofeo('europa', 1, 'Ganada con el nombre de Copa de la UEFA (2004)'),
    trofeo('supercopaEuropa', 2),
    trofeo('recopa', 1),
    trofeo('ferias', 2),
    trofeo('evaDuarte', 1),
  ],

  villarreal: [
    trofeo('europa', 1),
    trofeo('intertoto', 2),
  ],
}
