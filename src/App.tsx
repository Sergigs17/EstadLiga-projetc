
import { useEffect, useState } from 'react'
import './App.css'

import Inicio from './pages/Inicio'
import Equipos, { type Equipo } from './pages/Equipos'
import EquipoDetalle, { type Jugador } from './pages/EquipoDetalle'
import Jugadores from './pages/Jugadores'
import JugadorDetalle from './pages/JugadorDetalle'
import Clasificacion from './pages/Clasificacion'
import Partidos from './pages/Partidos'
import Quiniela from './pages/Quiniela'
import Tienda from './pages/Tienda'

function leerRuta() {
  return window.location.hash.replace(/^#\/?/, '') || 'inicio'
}

function App() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [jugadorDetalle, setJugadorDetalle] = useState<Jugador | null>(null)

  const [pagina, setPagina] = useState(leerRuta)
  const [cargando, setCargando] = useState(true)
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false)
  const [cargandoJugadorDetalle, setCargandoJugadorDetalle] = useState(false)

  const [errorEquipos, setErrorEquipos] = useState(false)
  const [errorPlantilla, setErrorPlantilla] = useState(false)

  useEffect(() => {
    const cambiarPagina = () => setPagina(leerRuta())

    window.addEventListener('hashchange', cambiarPagina)

    return () => {
      window.removeEventListener('hashchange', cambiarPagina)
    }
  }, [])

  useEffect(() => {
    fetch('/api/equipos')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se han podido cargar los equipos')
        }

        return respuesta.json() as Promise<Equipo[]>
      })
      .then(setEquipos)
      .catch(() => setErrorEquipos(true))
      .finally(() => setCargando(false))
  }, [])

  const partesRuta = pagina.split('/')

  // #/equipos/5  →  ficha del equipo
  // #/equipos/5/jugadores  →  ficha del equipo abierta en la pestaña de jugadores
  const SECCIONES_EQUIPO = ['historia', 'palmares', 'jugadores', 'estadisticas']

  const esFichaEquipo =
    partesRuta[0] === 'equipos' &&
    (partesRuta.length === 2 ||
      (partesRuta.length === 3 && SECCIONES_EQUIPO.includes(partesRuta[2])))

  const seccionEquipo = partesRuta.length === 3 ? partesRuta[2] : undefined

  const equipoId = esFichaEquipo ? Number(partesRuta[1]) : null

  const equipoSeleccionado = equipos.find(
    (equipo) => equipo.id === equipoId,
  )

  const esFichaJugador =
    partesRuta[0] === 'jugadores' &&
    partesRuta.length === 2 &&
    Number.isInteger(Number(partesRuta[1])) &&
    Number(partesRuta[1]) > 0

  const jugadorId = esFichaJugador ? Number(partesRuta[1]) : null

  // Cargar la plantilla del equipo seleccionado.
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
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se ha podido cargar la plantilla')
        }

        return respuesta.json() as Promise<Jugador[]>
      })
      .then((datos) => {
        if (!cancelado) {
          setJugadores(datos)
        }
      })
      .catch(() => {
        if (!cancelado) {
          setErrorPlantilla(true)
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargandoPlantilla(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [pagina, esFichaEquipo, equipoId])

  // Cargar los datos del jugador al abrir su ficha individual.
  useEffect(() => {
    if (!esFichaJugador || jugadorId === null) {
      setJugadorDetalle(null)
      setCargandoJugadorDetalle(false)
      return
    }

    let cancelado = false

    setJugadorDetalle(null)
    setCargandoJugadorDetalle(true)

    fetch('/api/jugadores')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se han podido cargar los jugadores')
        }

        return respuesta.json() as Promise<Jugador[]>
      })
      .then((datos) => {
        if (cancelado) return

        const encontrado = datos.find(
          (jugador) => jugador.id === jugadorId,
        )

        setJugadorDetalle(encontrado ?? null)
      })
      .catch(() => {
        if (!cancelado) {
          setJugadorDetalle(null)
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargandoJugadorDetalle(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [pagina, esFichaJugador, jugadorId])

  const esInicio = pagina === 'inicio'
  const esEquipos = pagina === 'equipos'
  const esJugadores = pagina === 'jugadores'
  const esClasificacion = pagina === 'clasificacion'
  const esPartidos = pagina === 'partidos'
  const esQuiniela = pagina === 'quiniela'
  const esTienda = pagina === 'tienda'

  return (
    <div className="estadliga">
      <header className="cabecera">
        <a className="logo" href="#/inicio">
          <img
            className="logo-imagen"
            src="/logo/Logo.png"
            alt="EstadLiga"
          />
        </a>

        <nav className="navegacion">
          <a
            className={esInicio ? 'activo' : ''}
            href="#/inicio"
          >
            Inicio
          </a>

          <a
            className={esEquipos || esFichaEquipo ? 'activo' : ''}
            href="#/equipos"
          >
            Equipos
          </a>

          <a
            className={esJugadores || esFichaJugador ? 'activo' : ''}
            href="#/jugadores"
          >
            Jugadores
          </a>

          <a
            className={esClasificacion ? 'activo' : ''}
            href="#/clasificacion"
          >
            Clasificación
          </a>

          <a
            className={esPartidos ? 'activo' : ''}
            href="#/partidos"
          >
            Partidos
          </a>

          <a
            className={esQuiniela ? 'activo' : ''}
            href="#/quiniela"
          >
            Quiniela
          </a>

          <a
            className={esTienda ? 'activo' : ''}
            href="#/tienda"
          >
            Tienda
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
            seccionInicial={seccionEquipo}
            jugadores={jugadores}
            cargando={cargandoPlantilla}
            error={errorPlantilla}
          />
        )}

        {esJugadores && <Jugadores />}

        {esFichaJugador && (
          <>
            {cargandoJugadorDetalle && (
              <section className="seccion-contenido">
                <p>Cargando ficha del jugador...</p>
              </section>
            )}

            {!cargandoJugadorDetalle && jugadorDetalle && (
              <JugadorDetalle jugador={jugadorDetalle} />
            )}

            {!cargandoJugadorDetalle && !jugadorDetalle && (
              <section className="seccion-contenido">
                <h2>Jugador no encontrado</h2>
                <p>
                  No hemos encontrado ese jugador en la base de datos.
                </p>
                <a
                  className="boton-principal"
                  href="#/equipos"
                >
                  Volver a los equipos →
                </a>
              </section>
            )}
          </>
        )}

        {esClasificacion && <Clasificacion />}

        {esPartidos && <Partidos />}

        {esQuiniela && <Quiniela />}

        {esTienda && <Tienda />}

        {!esInicio &&
          !esEquipos &&
          !esFichaEquipo &&
          !esJugadores &&
          !esFichaJugador &&
          !esClasificacion &&
          !esPartidos &&
          !esQuiniela &&
          !esTienda && (
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
          <img
            className="logo-imagen"
            src="/logo/Logo.png"
            alt="EstadLiga"
          />
        </a>

        <p>Proyecto educativo · Fútbol y estadísticas</p>
      </footer>
    </div>
  )
}

export default App
