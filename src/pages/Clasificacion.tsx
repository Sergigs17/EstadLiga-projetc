import './Clasificacion.css'

function Clasificacion() {
  return (
    <section className="seccion-contenido pagina-clasificacion">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">TEMPORADA ACTUAL</span>
          <h2>Clasificación de LaLiga</h2>
        </div>
        <p>Primera División</p>
      </div>

      <div className="clasificacion-pendiente">
        <div className="clasificacion-icono">🏆</div>
        <h3>Clasificación de la temporada</h3>
        <p>
          Aquí mostraremos la clasificación de los equipos, sus puntos,
          partidos jugados, victorias, empates, derrotas y goles.
        </p>
        <span>
          Pendiente de conectar los datos de la clasificación.
        </span>
      </div>

      <div className="grafico-pendiente">
        <h3>Evolución de los equipos</h3>
        <p>
          En este apartado mostraremos cómo cambia la posición de los equipos
          en cada jornada de LaLiga.
        </p>
        <div className="grafico-placeholder">
          <span>📈</span>
          <p>Gráfico de posiciones por jornada</p>
        </div>
      </div>
    </section>
  )
}

export default Clasificacion