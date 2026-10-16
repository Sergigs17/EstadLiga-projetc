
import type { Equipo } from '../../pages/Equipos'

interface CabeceraEquipoProps {
  equipo: Equipo | undefined
}

// Escudos guardados manualmente en public/escudos/
const ESCUDOS_EQUIPOS: Record<string, string> = {
  athletic: '/escudos/athletic.png',
  'athletic club': '/escudos/athletic.png',

  'atletico madrid': '/escudos/atlmadrid.png',
  'atletico de madrid': '/escudos/atlmadrid.png',
  'atletico de madrid club de futbol': '/escudos/atlmadrid.png',

  barcelona: '/escudos/barcelona.png',
  'fc barcelona': '/escudos/barcelona.png',

  betis: '/escudos/betis.png',
  'real betis': '/escudos/betis.png',

  celta: '/escudos/celta.png',
  'celta de vigo': '/escudos/celta.png',

  alaves: '/escudos/alaves.png',
  'deportivo alaves': '/escudos/alaves.png',

  elche: '/escudos/elche.png',
  'elche cf': '/escudos/elche.png',

  getafe: '/escudos/getafe.png',
  'getafe cf': '/escudos/getafe.png',

  levante: '/escudos/levante.png',
  'levante ud': '/escudos/levante.png',

  malaga: '/escudos/malaga.png',
  'malaga cf': '/escudos/malaga.png',

  osasuna: '/escudos/osasuna.png',
  'ca osasuna': '/escudos/osasuna.png',

  // Racing de Santander
  racing: '/escudos/racingsantander.png',
  'racing santander': '/escudos/racingsantander.png',
  'racing de santander': '/escudos/racingsantander.png',
  'r racing club': '/escudos/racingsantander.png',
  'real racing club': '/escudos/racingsantander.png',
  'real racing club de santander': '/escudos/racingsantander.png',

  // Deportivo de La Coruña
  deportivo: '/escudos/deportivocoruna.png',
  'deportivo coruna': '/escudos/deportivocoruna.png',
  'deportivo de la coruna': '/escudos/deportivocoruna.png',
  'rc deportivo': '/escudos/deportivocoruna.png',

  // Espanyol
  espanyol: '/escudos/espanyol.png',
  'rcd espanyol': '/escudos/espanyol.png',
  'rcd espanyol de barcelona': '/escudos/espanyol.png',
  'espanyol barcelona': '/escudos/espanyol.png',

  'rayo vallecano': '/escudos/rayovallecano.png',

  'real madrid': '/escudos/realmadrid.png',

  'real sociedad': '/escudos/realsociedad.png',

  sevilla: '/escudos/sevilla.png',
  'sevilla fc': '/escudos/sevilla.png',

  valencia: '/escudos/valencia.png',
  'valencia cf': '/escudos/valencia.png',

  villarreal: '/escudos/villarreal.png',
  'villarreal cf': '/escudos/villarreal.png',
}

function normalizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function CabeceraEquipo({ equipo }: CabeceraEquipoProps) {
  if (!equipo) {
    return (
      <div className="equipo-no-encontrado">
        <h1>Equipo no encontrado</h1>
        <p>No hemos encontrado este equipo en nuestra base de datos.</p>
      </div>
    )
  }

  const nombreNormalizado = normalizarNombre(equipo.nombre)
  const escudo = ESCUDOS_EQUIPOS[nombreNormalizado] ?? equipo.escudo

  return (
    <header className="cabecera-plantilla">
      {escudo ? (
        <img
          src={escudo}
          alt={`Escudo del ${equipo.nombre}`}
          onError={(evento) => {
            evento.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="escudo-pendiente" aria-label="Escudo no disponible">
          ⚽
        </div>
      )}

      <div>
        <h1>{equipo.nombre}</h1>

        {equipo.estadio && <p>Estadio: {equipo.estadio}</p>}
        {equipo.ciudad && <p>Ciudad: {equipo.ciudad}</p>}
        {equipo.entrenador && <p>Entrenador: {equipo.entrenador}</p>}
      </div>
    </header>
  )
}

export default CabeceraEquipo
