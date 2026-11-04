
import './Inicio.css'

const secciones = [
  {
    nombre: 'Equipos',
    descripcion: 'Consulta los clubes y sus plantillas.',
    icono: '🛡️',
    enlace: '#/equipos',
  },
  {
    nombre: 'Jugadores',
    descripcion: 'Descubre los mejores jugadores y sus estadísticas.',
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

function Inicio() {
  return (
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
            Estadísticas, equipos, jugadores y resultados de Primera División
            en un solo lugar.
          </p>

          <a className="boton-principal" href="#/equipos">
            Explorar LaLiga <span>→</span>
          </a>
        </div>

        <div className="presentacion-visual" aria-hidden="true">
          <div className="circulo circulo-externo" />
          <div className="circulo circulo-interior" />
          <div className="balon">⚽</div>

          <div className="dato-flotante">
            <span>ESTADÍSTICAS</span>
            <strong>Todo el fútbol</strong>
            <small>En un solo lugar</small>
          </div>
        </div>
      </section>

      <section className="seccion-contenido">
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
              <span className="tarjeta-icono">{seccion.icono}</span>
              <h3>{seccion.nombre}</h3>
              <p>{seccion.descripcion}</p>
              <span className="tarjeta-enlace">Explorar →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="bloque-informativo">
        <div>
          <span className="subtitulo">MÁS QUE RESULTADOS</span>
          <h2>Los datos también cuentan historias.</h2>
          <p>
            Sigue la evolución de los equipos y descubre todos los detalles
            de la competición.
          </p>
        </div>

        <a href="#/jugadores" className="boton-secundario">
          Ver estadísticas →
        </a>
      </section>
    </>
  )
}

export default Inicio
