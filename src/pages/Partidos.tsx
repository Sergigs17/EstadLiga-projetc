import './Partidos.css'

function Partidos() {
  return (
    <section className="seccion-contenido pagina-partidos">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">TEMPORADA ACTUAL</span>
          <h2>Calendario de LaLiga</h2>
        </div>
        <p>Primera División</p>
      </div>

      <div className="partidos-pendientes">
        <div className="partidos-icono">⚽</div>
        <h3>Partidos de LaLiga</h3>
        <p>
          Aquí podrás consultar los próximos encuentros, los resultados
          anteriores y las jornadas de la competición.
        </p>
        <span>
          Pendiente de conectar los datos de los partidos.
        </span>
      </div>
    </section>
  )
}

export default Partidos