import './App.css'

const secciones = [
  { nombre: 'Equipos', descripcion: 'Consulta los clubes de Primera División.', icono: '🛡️' },
  { nombre: 'Jugadores', descripcion: 'Descubre jugadores y sus estadísticas.', icono: '⚽' },
  { nombre: 'Clasificación', descripcion: 'Sigue la clasificación de LaLiga.', icono: '📊' },
  { nombre: 'Partidos', descripcion: 'Consulta resultados y próximos encuentros.', icono: '📅' },
]

function App() {
  return (
    <div className="estadliga">
      <header className="cabecera">
        <a className="logo" href="#inicio">
          <span className="logo-icono">E</span>
          <span>Estad<span className="logo-destacado">Liga</span></span>
        </a>

        <nav className="navegacion">
          <a className="activo" href="#inicio">Inicio</a>
          <a href="#equipos">Equipos</a>
          <a href="#jugadores">Jugadores</a>
          <a href="#clasificacion">Clasificación</a>
          <a href="#partidos">Partidos</a>
        </nav>

        <button className="boton-login" type="button">
          Iniciar sesión
        </button>
      </header>

      <main id="inicio">
        <section className="presentacion">
          <div className="presentacion-contenido">
            <span className="etiqueta">TU FÚTBOL, EN DATOS</span>
            <h1>Vive LaLiga.<br /><span>Entiende el juego.</span></h1>
            <p>
              Estadísticas, equipos, jugadores y resultados de Primera División
              en un solo lugar.
            </p>
            <a className="boton-principal" href="#equipos">
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
              <small>En tiempo real, cuando haya datos disponibles</small>
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

          <div className="rejilla-secciones" id="equipos">
            {secciones.map((seccion) => (
              <a
                className="tarjeta"
                href={`#${seccion.nombre.toLowerCase()}`}
                id={seccion.nombre.toLowerCase()}
                key={seccion.nombre}
              >
                <span className="tarjeta-icono">{seccion.icono}</span>
                <h3>{seccion.nombre}</h3>
                <p>{seccion.descripcion}</p>
                <span className="tarjeta-enlace">Explorar <span>→</span></span>
              </a>
            ))}
          </div>
        </section>

        <section className="bloque-informativo">
          <div>
            <span className="subtitulo">MÁS QUE RESULTADOS</span>
            <h2>Los datos también cuentan historias.</h2>
            <p>
              Sigue la evolución de los equipos, compara estadísticas y
              descubre todos los detalles de la competición.
            </p>
          </div>
          <a href="#clasificacion" className="boton-secundario">
            Ver clasificación →
          </a>
        </section>
      </main>

      <footer className="pie">
        <a className="logo" href="#inicio">
          <span className="logo-icono">E</span>
          <span>Estad<span className="logo-destacado">Liga</span></span>
        </a>
        <p>Proyecto educativo · Fútbol y estadísticas</p>
      </footer>
    </div>
  )
}

export default App