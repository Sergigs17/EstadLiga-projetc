
import { useEffect, useState } from 'react'
import './App.css'

interface Equipo {
  id: number
  nombre: string
  escudo: string | null
  entrenador: string | null
  estadio: string | null
  ciudad: string | null
}

interface Jugador {
  id: number
  nombre: string
  apellido: string | null
  posicion: string | null
  nacionalidad: string | null
  fecha_nacimiento: string | null
  dorsal: number | null
  equipo_id: number
  equipo: string
}

const secciones = [
  {
    nombre: 'Equipos',
    descripcion: 'Consulta los clubes de Primera División.',
    icono: '🛡️',
    enlace: '#/equipos',
  },
  {
    nombre: 'Jugadores',
    descripcion: 'Descubre jugadores y sus estadísticas.',
    icono: '⚽',
    enlace: '#/jugadores',
  },
  {
    nombre: 'Clasificación',
    descripcion: 'Sigue la clasificación de LaLiga.',
    icono: '📊',
    enlace: '#/clasificacion',
  },
  {
    nombre: 'Partidos',
    descripcion: 'Consulta resultados y próximos encuentros.',
    icono: '📅',
    enlace: '#/partidos',
  },
]

function App() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoJugadores, setCargandoJugadores] = useState(false)
  const [error, setError] = useState(false)
  const [errorJugadores, setErrorJugadores] = useState(false)
  const [pagina, setPagina] = useState(
    window.location.hash.replace('#/', '') || 'inicio',
  )
  const [busqueda, setBusqueda] = useState('')
  const [posicionSeleccionada, setPosicionSeleccionada] =
    useState('Todas')

  useEffect(() => {
    const cambiarPagina = () => {
      setPagina(window.location.hash.replace('#/', '') || 'inicio')
    }

    window.addEventListener('hashchange', cambiarPagina)
    return () => window.removeEventListener('hashchange', cambiarPagina)
  }, [])

  useEffect(() => {
    fetch('/api/equipos')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los equipos')
        }
        return respuesta.json() as Promise<Equipo[]>
      })
      .then((datos) => setEquipos(datos))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (pagina !== 'jugadores') return

    setCargandoJugadores(true)
    setErrorJugadores(false)

    fetch('/api/jugadores')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los jugadores')
        }
        return respuesta.json() as Promise<Jugador[]>
      })
      .then((datos) => setJugadores(datos))
      .catch(() => setErrorJugadores(true))
      .finally(() => setCargandoJugadores(false))
  }, [pagina])

  const esEquipos = pagina === 'equipos'
  const esJugadores = pagina === 'jugadores'

  const jugadoresFiltrados = jugadores.filter((jugador) => {
    const nombreCompleto =
      `${jugador.nombre} ${jugador.apellido ?? ''}`.toLowerCase()

    const coincideNombre = nombreCompleto.includes(
      busqueda.toLowerCase().trim(),
    )

    const coincidePosicion =
      posicionSeleccionada === 'Todas' ||
      jugador.posicion === posicionSeleccionada

    return coincideNombre && coincidePosicion
  })

  return (
    <div className="estadliga">
      <header className="cabecera">
        <a className="logo" href="#/inicio">
          <span className="logo-icono">E</span>
          <span>
            Estad<span className="logo-destacado">Liga</span>
          </span>
        </a>

        <nav className="navegacion">
          <a
            className={pagina === 'inicio' ? 'activo' : ''}
            href="#/inicio"
          >
            Inicio
          </a>
          <a
            className={esEquipos ? 'activo' : ''}
            href="#/equipos"
          >
            Equipos
          </a>
          <a
            className={esJugadores ? 'activo' : ''}
            href="#/jugadores"
          >
            Jugadores
          </a>
          <a href="#/clasificacion">Clasificación</a>
          <a href="#/partidos">Partidos</a>
        </nav>

        <button className="boton-login" type="button">
          Iniciar sesión
        </button>
      </header>

      <main id="inicio">
        {esEquipos ? (
          <section className="seccion-contenido pagina-equipos">
            <div className="titulo-seccion">
              <div>
                <span className="subtitulo">PRIMERA DIVISIÓN</span>
                <h1>Equipos de LaLiga</h1>
              </div>
              <p>{equipos.length} clubes</p>
            </div>

            {cargando && <p>Cargando equipos...</p>}

            {error && (
              <p>
                No se han podido cargar los equipos. Inténtalo más tarde.
              </p>
            )}

            {!cargando && !error && (
              <div className="rejilla-equipos">
                {equipos.map((equipo) => (
                  <article
                    className="tarjeta-equipo"
                    key={equipo.id}
                  >
                    {equipo.escudo ? (
                      <img
                        src={equipo.escudo}
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
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : esJugadores ? (
          <section className="seccion-contenido pagina-jugadores">
            <div className="titulo-seccion">
              <div>
                <span className="subtitulo">PRIMERA DIVISIÓN</span>
                <h1>Jugadores de LaLiga</h1>
              </div>
              <p>{jugadoresFiltrados.length} jugadores</p>
            </div>

            <div className="filtros-jugadores">
              <input
                type="search"
                placeholder="Buscar jugador..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                aria-label="Buscar jugador por nombre"
              />

              <select
                value={posicionSeleccionada}
                onChange={(evento) =>
                  setPosicionSeleccionada(evento.target.value)
                }
                aria-label="Filtrar por posición"
              >
                <option value="Todas">Todas las posiciones</option>
                <option value="Portero">Porteros</option>
                <option value="Defensa">Defensas</option>
                <option value="Centrocampista">Centrocampistas</option>
                <option value="Delantero">Delanteros</option>
              </select>
            </div>

            {cargandoJugadores && <p>Cargando jugadores...</p>}

            {errorJugadores && (
              <p>
                No se han podido cargar los jugadores. Inténtalo más tarde.
              </p>
            )}

            {!cargandoJugadores &&
              !errorJugadores &&
              jugadoresFiltrados.length === 0 && (
                <p>No se han encontrado jugadores con esos filtros.</p>
              )}

            {!cargandoJugadores &&
              !errorJugadores &&
              jugadoresFiltrados.length > 0 && (
                <div className="rejilla-jugadores">
                  {jugadoresFiltrados.map((jugador) => (
                    <article
                      className="tarjeta-jugador"
                      key={jugador.id}
                    >
                      <div className="jugador-dorsal">
                        {jugador.dorsal ?? '—'}
                      </div>

                      <div className="jugador-informacion">
                        <span className="jugador-equipo">
                          {jugador.equipo}
                        </span>

                        <h3>
                          {jugador.nombre} {jugador.apellido ?? ''}
                        </h3>

                        <p>
                          {jugador.posicion ?? 'Posición desconocida'}
                        </p>

                        <p>
                          {jugador.nacionalidad ??
                            'Nacionalidad desconocida'}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </section>
        ) : pagina === 'inicio' ? (
          <>
            <section className="presentacion">
              <div className="presentacion-contenido">
                <span className="etiqueta">TU FÚTBOL, EN DATOS</span>

                <h1>
                  Vive LaLiga.
                  <br />
                  <span>Entiende el juego.</span>
                </h1>

                <p>
                  Estadísticas, equipos, jugadores y resultados de
                  Primera División en un solo lugar.
                </p>

                <a className="boton-principal" href="#/equipos">
                  Explorar LaLiga <span>→</span>
                </a>
              </div>

              <div className="presentacion-visual" aria-hidden="true">
                <div className="circulo circulo-externo"></div>
                <div className="circulo circulo-interior"></div>
                <div className="balon">⚽</div>

                <div className="dato-flotante">
                  <span>ESTADÍSTICAS</span>
                  <strong>Todo el fútbol</strong>
                  <small>En un solo lugar</small>
                </div>
              </div>
            </section>

            <section className="seccion-contenido" id="secciones">
              <div className="titulo-seccion">
                <div>
                  <span className="subtitulo">DESCUBRE ESTADLIGA</span>
                  <h2>Todo lo que necesitas</h2>
                </div>
                <p>Explora la competición desde todos los ángulos.</p>
              </div>

              <div className="rejilla-secciones">
                {secciones.map((seccion) => (
                  <a
                    className="tarjeta"
                    href={seccion.enlace}
                    key={seccion.nombre}
                  >
                    <span className="tarjeta-icono">
                      {seccion.icono}
                    </span>
                    <h3>{seccion.nombre}</h3>
                    <p>{seccion.descripcion}</p>
                    <span className="tarjeta-enlace">
                      Explorar <span>→</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section className="bloque-informativo">
              <div>
                <span className="subtitulo">MÁS QUE RESULTADOS</span>
                <h2>Los datos también cuentan historias.</h2>
                <p>
                  Sigue la evolución de los equipos, compara estadísticas
                  y descubre todos los detalles de la competición.
                </p>
              </div>

              <a
                href="#/clasificacion"
                className="boton-secundario"
              >
                Ver clasificación →
              </a>
            </section>
          </>
        ) : (
          <section className="seccion-contenido">
            <div className="titulo-seccion">
              <div>
                <span className="subtitulo">ESTADLIGA</span>
                <h1>Próximamente</h1>
              </div>
            </div>

            <p>Esta sección todavía está en desarrollo.</p>
            <a className="boton-principal" href="#/inicio">
              Volver al inicio →
            </a>
          </section>
        )}
      </main>

      <footer className="pie">
        <a className="logo" href="#/inicio">
          <span className="logo-icono">E</span>
          <span>
            Estad<span className="logo-destacado">Liga</span>
          </span>
        </a>

        <p>Proyecto educativo · Fútbol y estadísticas</p>
      </footer>
    </div>
  )
}

export default App
