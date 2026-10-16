
import type { Equipo } from '../../pages/Equipos'

interface TrofeoClub {
  nombre: string
  cantidad: number | null
  imagen: string
}

interface PalmaresEquipoProps {
  equipo: Equipo
}

// PALMARÉS DE LOS 20 EQUIPOS DE LALIGA 2026/27.
//
// Para añadir un trofeo, escribe un objeto dentro del array del equipo:
//
// {
//   nombre: 'Liga española',
//   cantidad: 8, // Sustituye 8 por el número verificado de títulos.
//   imagen: '/trofeos/barcelona/liga.png',
// }
//
// La imagen debe estar guardada dentro de la carpeta public.
// Por ejemplo:
// public/trofeos/barcelona/liga.png
//
// Su ruta en el campo imagen será:
// /trofeos/barcelona/liga.png
//
// Si todavía no conoces los datos de un trofeo, no lo añadas aún.

const palmares: Record<string, TrofeoClub[]> = {
  // 1. ATHLETIC CLUB
  // Imágenes: public/trofeos/athletic/
  'athletic club': [
    // Añade aquí los trofeos del Athletic Club.
  ],

  // 2. ATLÉTICO DE MADRID
  // Imágenes: public/trofeos/atletico-madrid/
  'atletico de madrid': [
    // Añade aquí los trofeos del Atlético de Madrid.
  ],

  // 3. CA OSASUNA
  // Imágenes: public/trofeos/osasuna/
  'ca osasuna': [
    // Añade aquí los trofeos de Osasuna.
  ],

  // 4. CELTA
  // Imágenes: public/trofeos/celta/
  celta: [
    // Añade aquí los trofeos del Celta.
  ],

  // 5. DEPORTIVO ALAVÉS
  // Imágenes: public/trofeos/alaves/
  'deportivo alaves': [
    // Añade aquí los trofeos del Alavés.
  ],

  // 6. ELCHE CF
  // Imágenes: public/trofeos/elche/
  'elche cf': [
    // Añade aquí los trofeos del Elche.
  ],

  // 7. FC BARCELONA
  // Imágenes: public/trofeos/barcelona/
  'fc barcelona': [
    // Añade aquí los trofeos del FC Barcelona.
    // Ejemplo:
    // {
    //   nombre: 'Liga española',
    //   cantidad: 0, // Escribe la cantidad verificada.
    //   imagen: '/trofeos/barcelona/liga.png',
    // },
  ],

  // 8. GETAFE CF
  // Imágenes: public/trofeos/getafe/
  'getafe cf': [
    // Añade aquí los trofeos del Getafe.
  ],

  // 9. LEVANTE UD
  // Imágenes: public/trofeos/levante/
  'levante ud': [
    // Añade aquí los trofeos del Levante.
  ],

  // 10. MÁLAGA CF
  // Imágenes: public/trofeos/malaga/
  'malaga cf': [
    // Añade aquí los trofeos del Málaga.
  ],

  // 11. RACING DE SANTANDER
  // Imágenes: public/trofeos/racing-santander/
  'racing de santander': [
    // Añade aquí los trofeos del Racing de Santander.
  ],

  // 12. RAYO VALLECANO
  // Imágenes: public/trofeos/rayo-vallecano/
  'rayo vallecano': [
    // Añade aquí los trofeos del Rayo Vallecano.
  ],

  // 13. RC DEPORTIVO
  // Imágenes: public/trofeos/deportivo/
  'rc deportivo': [
    // Añade aquí los trofeos del RC Deportivo.
  ],

  // 14. RCD ESPANYOL
  // Imágenes: public/trofeos/espanyol/
  'rcd espanyol': [
    // Añade aquí los trofeos del RCD Espanyol.
  ],

  // 15. REAL BETIS
  // Imágenes: public/trofeos/betis/
  'real betis': [
    // Añade aquí los trofeos del Real Betis.
  ],

  // 16. REAL MADRID
  // Imágenes: public/trofeos/real-madrid/
  'real madrid': [
    // Añade aquí los trofeos del Real Madrid.
  ],

  // 17. REAL SOCIEDAD
  // Imágenes: public/trofeos/real-sociedad/
  'real sociedad': [
    // Añade aquí los trofeos de la Real Sociedad.
  ],

  // 18. SEVILLA FC
  // Imágenes: public/trofeos/sevilla/
  'sevilla fc': [
    // Añade aquí los trofeos del Sevilla FC.
  ],

  // 19. VALENCIA CF
  // Imágenes: public/trofeos/valencia/
  'valencia cf': [
    // Añade aquí los trofeos del Valencia CF.
  ],

  // 20. VILLARREAL CF
  // Imágenes: public/trofeos/villarreal/
  'villarreal cf': [
    // Añade aquí los trofeos del Villarreal.
  ],
}

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
  'real racing club': 'racing de santander',
  'racing de santander': 'racing de santander',
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

function PalmaresEquipo({ equipo }: PalmaresEquipoProps) {
  const nombreNormalizado = normalizarNombre(equipo.nombre)
  const clave = aliasEquipos[nombreNormalizado] ?? nombreNormalizado
  const trofeos = palmares[clave] ?? []

  return (
    <section className="bloque-palmares-equipo">
      <div className="encabezado-bloque-equipo">
        <span className="subtitulo">SUS LOGROS</span>
        <h2>Palmarés</h2>
        <p>Los títulos más destacados del club.</p>
      </div>

      {trofeos.length > 0 ? (
        <div className="rejilla-palmares">
          {trofeos.map((trofeo, indice) => (
            <article
              className="tarjeta-palmares"
              key={`${trofeo.nombre}-${indice}`}
            >
              {trofeo.imagen ? (
                <img
                  className="imagen-trofeo"
                  src={trofeo.imagen}
                  alt={`Trofeo: ${trofeo.nombre}`}
                  loading="lazy"
                  onError={(evento) => {
                    evento.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="icono-palmares" aria-hidden="true">
                  🏆
                </span>
              )}

              <div className="informacion-trofeo">
                <h3>{trofeo.nombre}</h3>
                <p>
                  {trofeo.cantidad === null
                    ? 'Cantidad pendiente de verificar'
                    : `${trofeo.cantidad} ${trofeo.cantidad === 1 ? 'título' : 'títulos'}`}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="palmares-pendiente">
          Estamos preparando el palmarés de este equipo.
        </p>
      )}
    </section>
  )
}

export default PalmaresEquipo
