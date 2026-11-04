/* =====================================================
   CATÁLOGO DE TROFEOS
   Aquí vive la información de cada trofeo: su imagen y su historia.
   Es lo que se ve en la viñeta cuando se hace clic en un trofeo.

   Las imágenes están en public/trofeos/ (una sola copia de cada una,
   compartida por todos los clubes).

   Para corregir o ampliar un texto, edita el trofeo correspondiente.
   ===================================================== */

export type ClaveTrofeo =
  | 'liga'
  | 'copa'
  | 'supercopa'
  | 'champions'
  | 'europa'
  | 'conference'
  | 'supercopaEuropa'
  | 'mundialClubes'
  | 'intercontinental'
  | 'recopa'
  | 'ferias'
  | 'intertoto'
  | 'latina'
  | 'evaDuarte'
  | 'copaLiga'
  | 'iberoamericana'
  | 'intercontinentalHistorica'

export type CategoriaTrofeo = 'nacional' | 'europeo' | 'mundial' | 'historico'

export interface InfoTrofeo {
  clave: ClaveTrofeo
  nombre: string
  /** Ruta de la imagen dentro de public/. */
  imagen: string
  categoria: CategoriaTrofeo
  /** Años en los que se ha disputado, para mostrar en una etiqueta. */
  periodo: string
  /** Quién lo organiza (solo si es un dato comprobado). */
  organizador?: string
  /** Una frase para la tarjeta. */
  resumen: string
  /** Historia, en párrafos. */
  historia: string[]
  /** Datos curiosos. */
  datos?: string[]
  /** Campeones españoles, ya comprobados. */
  campeonesEspanoles?: string[]
}

export const ETIQUETA_CATEGORIA: Record<CategoriaTrofeo, string> = {
  nacional: 'Competición nacional',
  europeo: 'Competición europea',
  mundial: 'Competición mundial',
  historico: 'Competición histórica',
}

export const TROFEOS: Record<ClaveTrofeo, InfoTrofeo> = {
  /* ───────── NACIONALES ───────── */

  liga: {
    clave: 'liga',
    nombre: 'LaLiga',
    imagen: '/trofeos/liga.png',
    categoria: 'nacional',
    periodo: 'Desde 1928-29',
    organizador: 'LaLiga · RFEF',
    resumen: 'El campeonato de liga del fútbol español.',
    historia: [
      'La Liga nació en la temporada 1928-29, cuando diez equipos se enfrentaron por primera vez en un campeonato de todos contra todos. Hasta entonces, el título de campeón de España se decidía en la Copa. El FC Barcelona fue el primer campeón de la historia.',
      'Desde entonces es la gran competición del fútbol español: se proclama campeón el equipo que suma más puntos al final de la temporada. Hoy la juegan 20 equipos que se enfrentan en 38 jornadas, y el sistema de tres puntos por victoria rige desde la temporada 1995-96.',
    ],
    datos: [
      'Real Madrid, FC Barcelona y Athletic Club son los tres clubes que nunca han descendido de Primera División.',
      'Se disputa de agosto a mayo, con 38 jornadas por equipo.',
    ],
  },

  copa: {
    clave: 'copa',
    nombre: 'Copa del Rey',
    imagen: '/trofeos/copa-del-rey.png',
    categoria: 'nacional',
    periodo: 'Desde 1903',
    organizador: 'RFEF',
    resumen: 'La competición nacional más antigua de España.',
    historia: [
      'Su origen está en la Copa de la Coronación de 1902, un torneo organizado en Madrid para celebrar la mayoría de edad del rey Alfonso XIII. Un año después, en 1903, se disputó la primera edición oficial del Campeonato de España, y el Athletic Club fue su primer campeón tras vencer al Madrid FC en el Hipódromo de la Castellana.',
      'Hasta que se creó la Liga en 1928 fue el título nacional por excelencia. Hoy es un torneo de eliminatorias directas en el que participan clubes de las cinco divisiones nacionales.',
      'Su nombre oficial es Campeonato de España – Copa de Su Majestad el Rey, pero el nombre popular ha ido cambiando con el régimen político: Copa del Rey (1903-1931), Copa del Presidente de la República (1932-1936), Copa del Generalísimo (1939-1976) y de nuevo Copa del Rey desde 1977.',
    ],
    datos: [
      'La primera edición, en 1903, se jugó en formato de liguilla.',
      'Es la competición nacional de fútbol más antigua de España.',
    ],
  },

  supercopa: {
    clave: 'supercopa',
    nombre: 'Supercopa de España',
    imagen: '/trofeos/supercopa-espana.png',
    categoria: 'nacional',
    periodo: 'Desde 1982',
    organizador: 'RFEF',
    resumen: 'El duelo entre los campeones de Liga y de Copa.',
    historia: [
      'La Supercopa nació en 1982, impulsada por el entonces presidente del FC Barcelona, José Luis Núñez, para enfrentar al campeón de Liga con el campeón de Copa. La primera edición la ganó la Real Sociedad.',
      'Al principio se jugaba a mitad de temporada, pero los problemas de calendario llevaron a la RFEF a adelantarla al inicio del curso en 1994. En 1986 y 1987 no se disputó, y en 1996 se decidió que, si un mismo club ganaba Liga y Copa, el rival sería el subcampeón de Copa.',
      'Desde 2020 se juega en formato de cuatro equipos (Final Four), y varias ediciones se han celebrado en Arabia Saudí.',
    ],
    datos: [
      'Su precursora oficial fue la Copa Eva Duarte (1947-1953).',
      'En 1984 y 1989 no hubo partido: Athletic Club y Real Madrid fueron campeones por haber ganado Liga y Copa en la misma temporada.',
    ],
  },

  /* ───────── EUROPEOS ───────── */

  champions: {
    clave: 'champions',
    nombre: 'UEFA Champions League',
    imagen: '/trofeos/champions.png',
    categoria: 'europeo',
    periodo: 'Desde 1955',
    organizador: 'UEFA',
    resumen: 'La máxima competición de clubes de Europa.',
    historia: [
      'Nació como Copa de Europa de Clubes Campeones en la temporada 1955-56. El Real Madrid fue el primer campeón: venció al Stade de Reims en la final de París y ganó las cinco primeras ediciones consecutivas. En 1992-93 pasó a llamarse Champions League y se abrió a más equipos por país.',
      'El trofeo que ves, apodado «la Orejona» (Big Ears), se estrenó en 1967. El original, un regalo del diario francés L’Équipe, se lo quedó el Real Madrid tras ganar su sexta Copa de Europa en 1966, y la UEFA encargó uno nuevo al joyero suizo Jörg Stadelmann, que tardó 340 horas en hacerlo.',
    ],
    datos: [
      'El Celtic fue el primer club en levantar el trofeo actual, en 1967.',
      'Desde 2009 la UEFA conserva siempre el trofeo original y los campeones reciben una réplica.',
      'El Real Madrid es el club con más títulos.',
    ],
  },

  europa: {
    clave: 'europa',
    nombre: 'UEFA Europa League',
    imagen: '/trofeos/europa-league.png',
    categoria: 'europeo',
    periodo: 'Desde 1971',
    organizador: 'UEFA',
    resumen: 'La segunda gran competición europea de clubes.',
    historia: [
      'La Europa League es la heredera de la Copa de la UEFA, que nació en 1971 para sustituir a la Copa de Ferias. Desde la temporada 2009-10 se llama Europa League y estrenó imagen y trofeo.',
      'Los clubes españoles han brillado en ella. Con el nombre de Copa de la UEFA ganaron el Real Madrid (1985 y 1986), el Valencia (2004) y el Sevilla (2006 y 2007). Ya como Europa League, la ganaron el Atlético de Madrid, el Sevilla y el Villarreal.',
    ],
    datos: [
      'El Atlético de Madrid ganó la primera Europa League, en 2010.',
      'El Sevilla es el club con más títulos de la competición.',
    ],
    campeonesEspanoles: [
      'Real Madrid (1985 y 1986, Copa de la UEFA)',
      'Valencia (2004, Copa de la UEFA)',
      'Sevilla (2006 y 2007, Copa de la UEFA · 2014, 2015, 2016, 2020 y 2023, Europa League)',
      'Atlético de Madrid (2010, 2012 y 2018)',
      'Villarreal (2021)',
    ],
  },

  conference: {
    clave: 'conference',
    nombre: 'UEFA Conference League',
    imagen: '/trofeos/conference-league.png',
    categoria: 'europeo',
    periodo: 'Desde 2021',
    organizador: 'UEFA',
    resumen: 'La tercera competición europea de clubes.',
    historia: [
      'La Conference League se estrenó en la temporada 2021-22 como tercera competición europea, por detrás de la Champions League y la Europa League. Su objetivo es dar protagonismo continental a más clubes y a más países.',
      'La Roma fue el primer campeón de su historia, en 2022.',
    ],
    datos: [
      'Es la competición europea de clubes más joven.',
      'Dos clubes españoles han llegado a la final: el Real Betis en 2025 y el Rayo Vallecano en 2026.',
    ],
  },

  supercopaEuropa: {
    clave: 'supercopaEuropa',
    nombre: 'Supercopa de Europa',
    imagen: '/trofeos/supercopa-europa.png',
    categoria: 'europeo',
    periodo: 'Desde 1972',
    organizador: 'UEFA',
    resumen: 'El campeón de la Champions contra el de la Europa League.',
    historia: [
      'La Supercopa de Europa se disputó por primera vez en 1972, entre el Ajax y el Rangers. Durante años enfrentó al campeón de la Copa de Europa con el de la Recopa; al desaparecer la Recopa, el rival pasó a ser el campeón de la Copa de la UEFA, hoy Europa League.',
      'Desde 1998 se juega a partido único en sede neutral. Real Madrid, FC Barcelona, Atlético de Madrid, Valencia, Real Zaragoza y Sevilla figuran entre los clubes españoles que la han ganado.',
    ],
  },

  /* ───────── MUNDIALES ───────── */

  mundialClubes: {
    clave: 'mundialClubes',
    nombre: 'Mundial de Clubes de la FIFA',
    imagen: '/trofeos/mundial-de-clubes.png',
    categoria: 'mundial',
    periodo: 'Desde 2000',
    organizador: 'FIFA',
    resumen: 'El torneo mundial de campeones continentales.',
    historia: [
      'La FIFA organizó el primer Mundial de Clubes en 2000, en Brasil, con ocho equipos; lo ganó el Corinthians. Se retomó en 2005 con un formato anual de siete equipos y sustituyó a la Copa Intercontinental.',
      'En 2025 se estrenó el nuevo formato, con 32 equipos y celebración cada cuatro años. Se jugó en Estados Unidos y ganó el Chelsea, que venció 3-0 al PSG en la final.',
      'Los equipos españoles dominaron la etapa anual: el Real Madrid ganó cinco ediciones y el FC Barcelona, tres.',
    ],
    campeonesEspanoles: [
      'Real Madrid (2014, 2016, 2017, 2018 y 2022)',
      'FC Barcelona (2009, 2011 y 2015)',
    ],
  },

  intercontinental: {
    clave: 'intercontinental',
    nombre: 'Copa Intercontinental de la FIFA',
    imagen: '/trofeos/intercontinental-fifa.png',
    categoria: 'mundial',
    periodo: 'Desde 2024',
    organizador: 'FIFA',
    resumen: 'La Copa Intercontinental, refundada en 2024.',
    historia: [
      'La FIFA recuperó la Copa Intercontinental en 2024, tras 20 años sin disputarse, con un formato anual que reúne a los campeones de las seis confederaciones. El campeón de Europa espera en la final al ganador de las rondas previas.',
      'La primera edición se jugó en diciembre de 2024 en Lusail (Catar): el Real Madrid venció 3-0 al Pachuca mexicano y se convirtió en el primer club con cuatro Copas Intercontinentales.',
      'Es una competición distinta del Mundial de Clubes, que desde 2025 se juega cada cuatro años con 32 equipos.',
    ],
    campeonesEspanoles: ['Real Madrid (2024)'],
  },

  /* ───────── HISTÓRICOS ───────── */

  recopa: {
    clave: 'recopa',
    nombre: 'Recopa de Europa',
    imagen: '/trofeos/recopa.png',
    categoria: 'historico',
    periodo: '1960 – 1999',
    organizador: 'UEFA',
    resumen: 'El torneo europeo de los campeones de Copa.',
    historia: [
      'La Recopa de Europa (oficialmente Copa de Campeones de Copa) enfrentaba a los campeones de las copas nacionales. Se jugó por primera vez en 1960-61, aunque la UEFA no la reconoció oficialmente hasta 1963, y duró 39 temporadas.',
      'En 1999 desapareció, fusionada con la Copa de la UEFA: desde entonces los campeones de copa entran en esa competición. La última edición la ganó la Lazio.',
      'Fue una competición muy española: el FC Barcelona es su máximo ganador con cuatro títulos.',
    ],
    datos: [
      'El Real Zaragoza ganó la Recopa de 1995 al Arsenal (2-1) con un gol de Nayim en el último minuto de la prórroga.',
    ],
    campeonesEspanoles: [
      'Atlético de Madrid (1962)',
      'FC Barcelona (1979, 1982, 1989 y 1997)',
      'Valencia (1980)',
      'Real Zaragoza (1995)',
    ],
  },

  ferias: {
    clave: 'ferias',
    nombre: 'Copa de Ferias',
    imagen: '/trofeos/copa-de-ferias.png',
    categoria: 'historico',
    periodo: '1955 – 1971',
    organizador: 'Comité de la Copa de Ferias',
    resumen: 'La antecesora de la Copa de la UEFA.',
    historia: [
      'La Copa de Ciudades en Ferias (Inter-Cities Fairs Cup) nació en 1955, idea del suizo Ernst Thommen, el italiano Ottorino Barrasi y el inglés Stanley Rous, para promover las ferias comerciales internacionales. Al principio solo podían participar ciudades que organizaban ferias, y muchas enviaban selecciones de varios clubes.',
      'La primera edición duró de 1955 a 1958 y la ganó el FC Barcelona. Los equipos españoles dominaron los primeros años: el Barcelona la ganó tres veces, el Valencia dos y el Zaragoza una.',
      'En 1971 fue sustituida por la Copa de la UEFA. Como nadie había ganado el trofeo de forma definitiva, el primer campeón (Barcelona) y el último (Leeds United) jugaron un partido para quedárselo: el Barcelona ganó 2-1 en el Camp Nou el 22 de septiembre de 1971.',
    ],
    datos: ['Hubo tres finales íntegramente españolas: en 1962, 1964 y 1966.'],
    campeonesEspanoles: [
      'FC Barcelona (1955-58, 1958-60 y 1965-66)',
      'Valencia (1961-62 y 1962-63)',
      'Real Zaragoza (1963-64)',
    ],
  },

  intertoto: {
    clave: 'intertoto',
    nombre: 'Copa Intertoto',
    imagen: '/trofeos/intertoto.png',
    categoria: 'historico',
    periodo: '1961 – 2008',
    organizador: 'UEFA (desde 1995)',
    resumen: 'El torneo de verano para entrar en Europa.',
    historia: [
      'La Copa Intertoto (de «inter» y el alemán «toto», quiniela) fue un torneo de verano para clubes europeos que no se habían clasificado para la Champions League ni para la Copa de la UEFA. Empezó en 1961 con el nombre de Copa Internacional de Fútbol, y la UEFA se hizo cargo de ella oficialmente en 1995.',
      'Con la UEFA funcionaba como una clasificatoria: varios ganadores de la final entraban en la Copa de la UEFA. Se abolió tras la edición de 2008, ya con Michel Platini como presidente de la UEFA.',
      'Los clubes españoles tuvieron mucho éxito. El Villarreal y el Schalke 04 fueron los únicos que consiguieron revalidar el título.',
    ],
    campeonesEspanoles: ['Málaga (2002)', 'Villarreal (2003 y 2004)'],
  },

  latina: {
    clave: 'latina',
    nombre: 'Copa Latina',
    imagen: '/trofeos/copa-latina.png',
    categoria: 'historico',
    periodo: '1949 – 1957',
    organizador: 'Federaciones de España, Italia, Francia y Portugal',
    resumen: 'El germen de la Copa de Europa.',
    historia: [
      'La Copa Latina enfrentaba a los campeones de Liga de España, Italia, Francia y Portugal. Se jugó entre 1949 y 1957, con semifinales, final y partido por el tercer puesto, y cada año la organizaba una de las cuatro federaciones.',
      'Se considera un precursor de la actual Liga de Campeones. Los clubes españoles la ganaron cuatro veces.',
      'En la final de 1955, el Real Madrid venció 2-0 al Stade de Reims con dos goles de Héctor Rial, un año antes de enfrentarse al mismo rival en la primera final de la Copa de Europa. En la de 1957 superó 1-0 al Benfica con gol de Di Stéfano.',
    ],
    campeonesEspanoles: ['FC Barcelona (1949 y 1952)', 'Real Madrid (1955 y 1957)'],
  },

  evaDuarte: {
    clave: 'evaDuarte',
    nombre: 'Copa Eva Duarte',
    imagen: '/trofeos/copa-eva-duarte.png',
    categoria: 'historico',
    periodo: '1947 – 1953',
    organizador: 'RFEF',
    resumen: 'La antecesora de la Supercopa de España.',
    historia: [
      'La Copa Eva Duarte de Perón se creó en 1947 y la donó la propia Eva Perón durante su visita a España. Enfrentaba al campeón de Liga con el campeón de Copa y es el precedente oficial inmediato de la Supercopa de España.',
      'La primera edición la ganó el Real Madrid, que venció 3-1 al Valencia (el partido no se jugó hasta junio de 1948). En la tercera, el Valencia, campeón de Copa, derrotó al FC Barcelona por 7-4 en Chamartín. En 1952 y 1953 el Barcelona recibió el trofeo sin jugar, porque ganó Liga y Copa en la misma temporada.',
      'Tras el fallecimiento de Eva Perón en 1952 el torneo dejó de disputarse, y la idea de enfrentar a los dos campeones no se recuperó hasta 1982.',
    ],
    datos: [
      'No todos los clubes lo cuentan en su palmarés: el FC Barcelona sí incluye sus tres Copas Eva Duarte.',
    ],
  },

  copaLiga: {
    clave: 'copaLiga',
    nombre: 'Copa de la Liga',
    imagen: '/trofeos/copa-de-la-liga.png',
    categoria: 'historico',
    periodo: '1982 – 1986',
    resumen: 'Un torneo de liga que solo duró cuatro ediciones.',
    historia: [
      'La Copa de la Liga se disputó entre 1982 y 1986 con los equipos de Primera División (18 en la primera edición). Por la falta de fechas en el calendario, la saturación y la presión de los clubes, solo duró cuatro ediciones.',
      'Ganaron el FC Barcelona (1983 y 1986), el Real Valladolid (1984) y el Real Madrid (1985).',
    ],
    datos: [
      'Hugo Sánchez fue el máximo goleador histórico del torneo, con 14 goles con el Atlético de Madrid.',
    ],
    campeonesEspanoles: [
      'FC Barcelona (1983 y 1986)',
      'Real Valladolid (1984)',
      'Real Madrid (1985)',
    ],
  },

  iberoamericana: {
    clave: 'iberoamericana',
    nombre: 'Copa Iberoamericana',
    imagen: '/trofeos/copa-iberoamericana.png',
    categoria: 'historico',
    periodo: '1994',
    organizador: 'CONMEBOL y RFEF',
    resumen: 'Una competición de una sola edición.',
    historia: [
      'La Copa Iberoamericana, también llamada Copa Iberia por su patrocinador, se creó en 1994 para enfrentar al campeón de la Copa de Oro de la CONMEBOL con el de la Copa del Rey, tras un acuerdo entre la CONMEBOL y la RFEF.',
      'Solo se disputó una vez: el Real Madrid, campeón de la Copa del Rey 1992-93, se midió al Boca Juniors, campeón de la Copa de Oro 1993. Ganó la ida 3-1 en el Bernabéu (19 de mayo de 1994) y perdió 2-1 en La Bombonera (25 de mayo), así que se llevó el trofeo por 4-3 en el global.',
      'En 2015 la CONMEBOL incluyó esta copa en su lista de competiciones oficiales.',
    ],
    campeonesEspanoles: ['Real Madrid (1994, única edición)'],
  },

  intercontinentalHistorica: {
    clave: 'intercontinentalHistorica',
    nombre: 'Copa Intercontinental',
    imagen: '/trofeos/intercontinental-historica.png',
    categoria: 'historico',
    periodo: '1960 – 2004',
    organizador: 'UEFA y CONMEBOL',
    resumen: 'El duelo entre los campeones de Europa y Sudamérica.',
    historia: [
      'Entre 1960 y 2004, la Copa Intercontinental enfrentó a los campeones de Europa (Copa de Europa y Champions League) y de Sudamérica (Copa Libertadores). Nació como iniciativa conjunta de la UEFA y la CONMEBOL para decidir el mejor club del planeta. Desde 1980, con el patrocinio de Toyota, pasó a ser un único partido en terreno neutral en Japón.',
      'El Real Madrid fue el primer campeón, en 1960 (0-0 y 5-1 al Peñarol), y la ganó de nuevo en 1998 y 2002. El Atlético de Madrid la ganó en 1974 sin ser campeón de Europa: jugó la final porque el Bayern renunció, y venció al Independiente (0-1 y 2-0).',
      'La última edición, en 2004, la ganó el Porto, y la competición fue sustituida por el Mundial de Clubes. En 2017 la FIFA reconoció a sus ganadores como campeones intercontinentales.',
    ],
    campeonesEspanoles: [
      'Real Madrid (1960, 1998 y 2002)',
      'Atlético de Madrid (1974)',
    ],
  },
}
