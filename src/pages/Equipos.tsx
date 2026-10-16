
import './Equipos.css'

export interface Equipo {
  id: number
  nombre: string
  escudo: string | null
  entrenador: string | null
  estadio: string | null
  ciudad: string | null
}

interface EquiposProps {
  equipos: Equipo[]
  cargando: boolean
  error: boolean
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

  // Deportivo Alavés
  alaves: '/escudos/alaves.png',
  'deportivo alaves': '/escudos/alaves.png',
  'deportivo alaves sad': '/escudos/alaves.png',

  // Elche
  elche: '/escudos/elche.png',
  'elche cf': '/escudos/elche.png',

  // Getafe
  getafe: '/escudos/getafe.png',
  'getafe cf': '/escudos/getafe.png',

  // Levante
  levante: '/escudos/levante.png',
  'levante ud': '/escudos/levante.png',
  'levante union deportiva': '/escudos/levante.png',

  // Málaga
  malaga: '/escudos/malaga.png',
  'malaga cf': '/escudos/malaga.png',

  // CA Osasuna
  osasuna: '/escudos/osasuna.png',
  'ca osasuna': '/escudos/osasuna.png',
  'club atletico osasuna': '/escudos/osasuna.png',

  // Racing de Santander
  racing: '/escudos/racingsantander.png',
  'racing santander': '/escudos/racingsantander.png',
  'racing de santander': '/escudos/racingsantander.png',
  'real racing club': '/escudos/racingsantander.png',
  'real racing club de santander': '/escudos/racingsantander.png',
  'real racing club santander': '/escudos/racingsantander.png',
  'r racing club': '/escudos/racingsantander.png',

  // Deportivo de La Coruña
  deportivo: '/escudos/deportivocoruna.png',
  'deportivo coruna': '/escudos/deportivocoruna.png',
  'deportivo de la coruna': '/escudos/deportivocoruna.png',
  'rc deportivo': '/escudos/deportivocoruna.png',
  'rc deportivo de la coruna': '/escudos/deportivocoruna.png',

  // RCD Espanyol
  espanyol: '/escudos/espanyol.png',
  'rcd espanyol': '/escudos/espanyol.png',
  'espanyol barcelona': '/escudos/espanyol.png',
  'rcd espanyol de barcelona': '/escudos/espanyol.png',

  'rayo vallecano': '/escudos/rayovallecano.png',

  'real madrid': '/escudos/realmadrid.png',

  'real sociedad': '/escudos/realsociedad.png',

  sevilla: '/escudos/sevilla.png',
  'sevilla fc': '/escudos/sevilla.png',

  // Valencia
  valencia: '/escudos/valencia.png',
  'valencia cf': '/escudos/valencia.png',

  // Villarreal
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

function obtenerEscudo(equipo: Equipo): string | null {
  const nombre = normalizarNombre(equipo.nombre)

  // Priorizamos el escudo local para que siempre se usen
  // las imágenes que hemos guardado en public/escudos.
  return ESCUDOS_EQUIPOS[nombre] ?? equipo.escudo
}

function Equipos({ equipos, cargando, error }: EquiposProps) {
  return (
    <section className="seccion-contenido pagina-equipos">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">PRIMERA DIVISIÓN</span>
          <h2>Equipos de LaLiga</h2>
        </div>
        <p>{equipos.length} clubes</p>
      </div>

      {cargando && <p>Cargando equipos...</p>}

      {error && (
        <p>
          No se han podido cargar los equipos. Inténtalo más tarde.
        </p>
      )}

      {!cargando && !error && equipos.length === 0 && (
        <div className="mensaje-vacio">
          <span>⚽</span>
          <h3>No hay equipos disponibles</h3>
          <p>Actualmente no tenemos equipos para mostrar.</p>
        </div>
      )}

      {!cargando && !error && equipos.length > 0 && (
        <div className="rejilla-equipos">
          {equipos.map((equipo) => {
            const escudo = obtenerEscudo(equipo)

            return (
              <a
                className="tarjeta-equipo"
                key={equipo.id}
                href={`#/equipos/${equipo.id}`}
              >
                {escudo ? (
                  <img
                    src={escudo}
                    alt={`Escudo del ${equipo.nombre}`}
                    onError={(evento) => {
                      evento.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="escudo-pendiente">⚽</div>
                )}

                <h3>{equipo.nombre}</h3>

                {equipo.estadio && <p>{equipo.estadio}</p>}
                {equipo.ciudad && <p>{equipo.ciudad}</p>}

                <span className="enlace-plantilla">
                  Ver plantilla →
                </span>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Equipos
