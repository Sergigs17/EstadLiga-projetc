import { useEffect, useState } from 'react'
import './App.css'
import Inicio from './pages/Inicio'
import Equipos, { type Equipo } from './pages/Equipos'
import EquipoDetalle, { type Jugador } from './pages/EquipoDetalle'
import Jugadores from './pages/Jugadores'
import Clasificacion from './pages/Clasificacion'
import Partidos from './pages/Partidos'

function leerRuta() {
  return window.location.hash.replace(/^#\/?/, '') || 'inicio'
}

function App() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [pagina, setPagina] = useState(leerRuta)
  const [cargando, setCargando] = useState(true)
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false)
  const [errorEquipos, setErrorEquipos] = useState(false)
  const [errorPlantilla, setErrorPlantilla] = useState(false)

  useEffect(() => {
    const cambiarPagina = () => setPagina(leerRuta())

    window.addEventListener('hashchange', cambiarPagina)

    return () => window.removeEventListener('hashchange', cambiarPagina)
  }, [])

  useEffect(() => {
    fetch('/api/equipos')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<Equipo[]>
      })
      .then(setEquipos)
      .catch(() => setErrorEquipos(true))
      .finally(() => setCargando(false))
  }, [])

  const partesRuta = pagina.split('/')
  const esFichaEquipo =
    partesRuta[0] === 'equipos' && partesRuta.length === 2

  const equipoId = esFichaEquipo ? Number(partesRuta[1]) : null
  const equipoSeleccionado = equipos.find((equipo) => equipo.id === equipoId)

  useEffect(() => {
    if (!esFichaEquipo || !equipoId || !Number.isFinite(equipoId)) {
      setJugadores([])
      setCargandoPlantilla(false)
      return
    }

    let cancelado = false

    setCargandoPlantilla(true)
    setErrorPlantilla(false)
    setJugadores([])

    fetch(`/api/jugadores?equipo_id=${equipoId}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<Jugador[]>
      })
      .then((datos) => {
        if (!cancelado) setJugadores(datos)
      })
      .catch(() => {
        if (!cancelado) setErrorPlantilla(true)
      })
      .finally(() => {
        if (!cancelado) setCargandoPlantilla(false)
      })

    return () => {
      cancelado = true
    }
  }, [pagina, esFichaEquipo, equipoId])

  const esEquipos = pagina === 'equipos'
  const esJugadores = pagina === 'jugadores'
  const esInicio = pagina === 'inicio'
  const esClasificacion = pagina === 'clasificacion'
  const esPartidos = pagina === 'partidos'

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
          <a className={esInicio ? 'activo' : ''} href="#/inicio">
            Inicio
          </a>
          <a
            className={esEquipos || esFichaEquipo ? 'activo' : ''}
            href="#/equipos"
          >
            Equipos
          </a>
          <a className={esJugadores ? 'activo' : ''} href="#/jugadores">
            Jugadores
          </a>
          <a
            className={esClasificacion ? 'activo' : ''}
            href="#/clasificacion"
          >
            Clasificación
          </a>
          <a className={esPartidos ? 'activo' : ''} href="#/partidos">
            Partidos
          </a>
        </nav>

        <button className="boton-login" type="button">
          Iniciar sesión
        </button>
      </header>

      <main>
        {esInicio && <Inicio />}

        {esEquipos && (
          <Equipos
            equipos={equipos}
            cargando={cargando}
            error={errorEquipos}
          />
        )}

        {esFichaEquipo && (
          <EquipoDetalle
            equipo={equipoSeleccionado}
            jugadores={jugadores}
            cargando={cargandoPlantilla}
            error={errorPlantilla}
          />
        )}

        {esJugadores && <Jugadores />}

        {esClasificacion && <Clasificacion />}

        {esPartidos && <Partidos />}

        {!esInicio &&
          !esEquipos &&
          !esFichaEquipo &&
          !esJugadores &&
          !esClasificacion &&
          !esPartidos && (
            <section className="seccion-contenido">
              <h2>Página no encontrada</h2>
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