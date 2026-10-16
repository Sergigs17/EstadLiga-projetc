
import type { Equipo } from '../../pages/Equipos'

interface HistoriaClub {
  titulo: string
  descripcion: string
}

interface HistoriaEquipoProps {
  equipo: Equipo
}

// Aquí se guarda la historia de cada club.
// Escribe el título y la descripción dentro de cada equipo.
// Deja los campos como '' si todavía no has preparado su historia.

const historias: Record<string, HistoriaClub> = {
  // 1. ATHLETIC CLUB
  'athletic club': {
    titulo: '',
    descripcion: '',
  },

  // 2. ATLÉTICO DE MADRID
  'atletico de madrid': {
    titulo: '',
    descripcion: '',
  },

  // 3. CA OSASUNA
  'ca osasuna': {
    titulo: '',
    descripcion: '',
  },

  // 4. CELTA
  celta: {
    titulo: '',
    descripcion: '',
  },

  // 5. DEPORTIVO ALAVÉS
  'deportivo alaves': {
    titulo: '',
    descripcion: '',
  },

  // 6. ELCHE CF
  'elche cf': {
    titulo: '',
    descripcion: '',
  },

  // 7. FC BARCELONA
  'fc barcelona': {
    titulo: '',
    descripcion: '',
  },

  // 8. GETAFE CF
  'getafe cf': {
    titulo: '',
    descripcion: '',
  },

  // 9. LEVANTE UD
  'levante ud': {
    titulo: '',
    descripcion: '',
  },

  // 10. MÁLAGA CF
  'malaga cf': {
    titulo: '',
    descripcion: '',
  },

  // 11. RACING DE SANTANDER
  'racing de santander': {
    titulo: '',
    descripcion: '',
  },

  // 12. RAYO VALLECANO
  'rayo vallecano': {
    titulo: '',
    descripcion: '',
  },

  // 13. RC DEPORTIVO
  'rc deportivo': {
    titulo: '',
    descripcion: '',
  },

  // 14. RCD ESPANYOL
  'rcd espanyol': {
    titulo: '',
    descripcion: '',
  },

  // 15. REAL BETIS
  'real betis': {
    titulo: '',
    descripcion: '',
  },

  // 16. REAL MADRID
  'real madrid': {
    titulo: '',
    descripcion: '',
  },

  // 17. REAL SOCIEDAD
  'real sociedad': {
    titulo: '',
    descripcion: '',
  },

  // 18. SEVILLA FC
  'sevilla fc': {
    titulo: '',
    descripcion: '',
  },

  // 19. VALENCIA CF
  'valencia cf': {
    titulo: '',
    descripcion: '',
  },

  // 20. VILLARREAL CF
  'villarreal cf': {
    titulo: '',
    descripcion: '',
  },
}

// Algunos nombres de la base de datos pueden ser diferentes.
// Añade aquí cualquier otro nombre que utilice tu base de datos.
const aliasEquipos: Record<string, string> = {
  barcelona: 'fc barcelona',
  'atletico madrid': 'atletico de madrid',
  osasuna: 'ca osasuna',
  'celta de vigo': 'celta',
  alaves: 'deportivo alaves',
  elche: 'elche cf',
  getafe: 'getafe cf',
  levante: 'levante ud',
  malaga: 'malaga cf',
  'racing club': 'racing de santander',
  'racing de santander': 'racing de santander',
  'real racing club': 'racing de santander',
  deportivo: 'rc deportivo',
  'deportivo de la coruna': 'rc deportivo',
  'rc deportivo de la coruna': 'rc deportivo',
  espanyol: 'rcd espanyol',
  'rcd espanyol de barcelona': 'rcd espanyol',
  betis: 'real betis',
  sevilla: 'sevilla fc',
  valencia: 'valencia cf',
  villarreal: 'villarreal cf',
  athletic: 'athletic club',
}

function normalizarNombre(nombre: string): string {
  return nombre
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function HistoriaEquipo({ equipo }: HistoriaEquipoProps) {
  const nombreNormalizado = normalizarNombre(equipo.nombre)
  const clave = aliasEquipos[nombreNormalizado] ?? nombreNormalizado
  const historia = historias[clave]

  return (
    <section className="bloque-historia-equipo">
      <div className="encabezado-bloque-equipo">
        <span className="subtitulo">CONOCE EL CLUB</span>
        <h2>Historia del {equipo.nombre}</h2>
      </div>

      {historia?.descripcion ? (
        <>
          {historia.titulo && <h3>{historia.titulo}</h3>}
          <p>{historia.descripcion}</p>
        </>
      ) : (
        <p>
          Estamos preparando la historia de este club. Próximamente encontrarás
          información sobre sus orígenes, su trayectoria y sus momentos más
          importantes.
        </p>
      )}
    </section>
  )
}

export default HistoriaEquipo
