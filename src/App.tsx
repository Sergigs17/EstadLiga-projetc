import { useEffect, useState } from 'react'
import './App.css'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Equipos, { type Equipo } from './pages/Equipos'
import EquipoDetalle, { type Jugador } from './pages/EquipoDetalle'
import Jugadores from './pages/Jugadores'
import JugadorDetalle from './pages/JugadorDetalle'
import Clasificacion from './pages/Clasificacion'
import Partidos from './pages/Partidos'
import Quiniela from './pages/Quiniela'
import Tienda from './pages/Tienda'
import BuscadorGlobal from './components/BuscadorGlobal'
import Cargando from './components/Cargando'
import MisFavoritos from './pages/MisFavoritos'
import MiCuenta from './pages/MiCuenta'
import Seguridad from './pages/Seguridad'

function leerRuta() {
  return window.location.hash.replace(/^#\/?/, '') || 'inicio'
}
interface UsuarioSesion {
  id: number
  nombre: string
  email: string
  rol: string
}

function App() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [jugadorDetalle, setJugadorDetalle] = useState<Jugador | null>(null)
  const [pagina, setPagina] = useState(leerRuta)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion | null>(null)
  const [comprobandoSesion, setComprobandoSesion] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false)
  const [cargandoJugadorDetalle, setCargandoJugadorDetalle] = useState(false)
  const [errorEquipos, setErrorEquipos] = useState(false)
  const [errorPlantilla, setErrorPlantilla] = useState(false)
  useEffect(() => {
    const cambiarPagina = () => {
      setPagina(leerRuta())
      setMenuAbierto(false)
    }
    window.addEventListener('hashchange', cambiarPagina)
    return () => {
      window.removeEventListener('hashchange', cambiarPagina)
    }
  }, [])
  // Mantener la cabecera sincronizada con la sesión del servidor.
  useEffect(() => {
    let activo = true
    let solicitudActual = 0

    async function actualizarSesion() {
      const solicitud = ++solicitudActual
      try {
        const respuesta = await fetch('/api/auth/usuario', {
          credentials: 'same-origin',
          cache: 'no-store',
        })
        if (!activo || solicitud !== solicitudActual) return
        if (!respuesta.ok) {
          setUsuarioSesion(null)
          return
        }
        const datos: { usuario?: UsuarioSesion } = await respuesta.json()
        if (activo && solicitud === solicitudActual) {
          setUsuarioSesion(datos.usuario ?? null)
        }
      } catch {
        // Si no se puede comprobar, no mostrar una sesión sin verificar.
        if (activo && solicitud === solicitudActual) setUsuarioSesion(null)
      } finally {
        if (activo && solicitud === solicitudActual) setComprobandoSesion(false)
      }
    }

    void actualizarSesion()
    window.addEventListener('estadliga:auth-cambio', actualizarSesion)
    window.addEventListener('focus', actualizarSesion)

    return () => {
      activo = false
      window.removeEventListener('estadliga:auth-cambio', actualizarSesion)
      window.removeEventListener('focus', actualizarSesion)
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
  const esLogin = pagina === 'login'
  const esMiCuenta = pagina === 'mi-cuenta'
  const esSeguridad = pagina === 'mi-cuenta/seguridad'
  const partesRuta = pagina.split('/')
  // #/equipos/5 → ficha del equipo
  // #/equipos/5/jugadores → pestaña de jugadores
  const SECCIONES_EQUIPO = [
    'historia',
    'palmares',
    'jugadores',
    'estadisticas',
  ]
  const esFichaEquipo =
    partesRuta[0] === 'equipos' &&
    (partesRuta.length === 2 ||
      (partesRuta.length === 3 &&
        SECCIONES_EQUIPO.includes(partesRuta[2])))
  const seccionEquipo =
    partesRuta.length === 3 ? partesRuta[2] : undefined
  const equipoId = esFichaEquipo ? Number(partesRuta[1]) : null
  const equipoSeleccionado = equipos.find(
    (equipo) => equipo.id === equipoId,
  )
  const esFichaJugador =
    partesRuta[0] === 'jugadores' &&
    partesRuta.length === 2 &&
    Number.isInteger(Number(partesRuta[1])) &&
    Number(partesRuta[1]) > 0
  const jugadorId = esFichaJugador
    ? Number(partesRuta[1])
    : null
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
  const esFavoritos = pagina === 'favoritos'
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
        <nav
          id="menu-principal"
          className={`navegacion ${
            menuAbierto ? 'navegacion-abierta' : ''
          }`}
          aria-label="Navegación principal"
        >
          <a
            onClick={() => setMenuAbierto(false)}
            className={esInicio ? 'activo' : ''}
            href="#/inicio"
          >
            Inicio
          </a>
          <a
            onClick={() => setMenuAbierto(false)}
            className={
              esEquipos || esFichaEquipo ? 'activo' : ''
            }
            href="#/equipos"
          >
            Equipos
          </a>
          <a
            onClick={() => setMenuAbierto(false)}
            className={
              esJugadores || esFichaJugador ? 'activo' : ''
            }
            href="#/jugadores"
          >
            Jugadores
          </a>
          <a
            onClick={() => setMenuAbierto(false)}
            className={esClasificacion ? 'activo' : ''}
            href="#/clasificacion"
          >
            Clasificación
          </a>
          <a
            onClick={() => setMenuAbierto(false)}
            className={esPartidos ? 'activo' : ''}
            href="#/partidos"
          >
            Partidos
          </a>
          <a
            onClick={() => setMenuAbierto(false)}
            className={esQuiniela ? 'activo' : ''}
            href="#/quiniela"
          >
            Quiniela
          </a>
          <a
            onClick={() => setMenuAbierto(false)}
            className={esTienda ? 'activo' : ''}
            href="#/tienda"
          >
            Tienda
          </a>
          {usuarioSesion && (
            <a href="#/favoritos" className={esFavoritos ? 'activo' : ''} onClick={() => setMenuAbierto(false)}>Mis favoritos</a>
          )}
          <button
            className="login-menu-movil"
            type="button"
            onClick={() => {
              window.location.hash = usuarioSesion
              ? '#/mi-cuenta'
              : '#/login'
              setMenuAbierto(false)
            }}
          >
          {comprobandoSesion
            ? 'Comprobando...'
            : usuarioSesion?.nombre ?? 'Iniciar sesión'}
        </button>
        </nav>
        <div className="cabecera-acciones">
          <BuscadorGlobal />
        {usuarioSesion && <a className="enlace-favoritos-cabecera" href="#/favoritos">Mis favoritos</a>}
          <button
            className="boton-login"
            type="button"
            onClick={() => {
              window.location.hash = '#/login'
            }}
          >
          {comprobandoSesion
            ? 'Comprobando...'
            : usuarioSesion?.nombre ?? 'Iniciar sesión'}
        </button>
          <button
            className="boton-hamburguesa"
            type="button"
            aria-label={
              menuAbierto ? 'Cerrar menú' : 'Abrir menú'
            }
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? (
              <span className="hamburguesa-cerrar">×</span>
            ) : (
              <>
                <span />
                <span />
                <span />
              </>
            )}
          </button>
        </div>
      </header>
      <main>
        {esInicio && <Inicio />}
        {esLogin && <Login />}
        {esMiCuenta && <MiCuenta />}
        {esSeguridad && <Seguridad />}
        {esEquipos && (
          <Equipos
            equipos={equipos}
            cargando={cargando}
            error={errorEquipos}
          />
        )}
        {esFichaEquipo && (
          <>
            {cargando && !equipoSeleccionado ? (
              <section className="seccion-contenido">
                <Cargando mensaje="Cargando equipo..." />
              </section>
            ) : (
              <EquipoDetalle
                equipo={equipoSeleccionado}
                seccionInicial={seccionEquipo}
                jugadores={jugadores}
                cargando={cargandoPlantilla}
                error={errorPlantilla}
              />
            )}
          </>
        )}
        {esJugadores && <Jugadores />}
        {esFichaJugador && (
          <>
            {cargandoJugadorDetalle && (
              <section className="seccion-contenido">
                <Cargando mensaje="Cargando ficha del jugador..." />
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
        {esFavoritos && <MisFavoritos usuario={usuarioSesion} comprobandoSesion={comprobandoSesion} />}
        {!esInicio &&
          !esEquipos &&
          !esFichaEquipo &&
          !esJugadores &&
          !esFichaJugador &&
          !esClasificacion &&
          !esPartidos &&
          !esQuiniela &&
          !esTienda &&
          !esFavoritos &&
          !esLogin &&
          !esMiCuenta &&
          !esSeguridad && (
            <section className="seccion-contenido">
              <h2>Página no encontrada</h2>
              <a
                className="boton-principal"
                href="#/inicio"
              >
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
