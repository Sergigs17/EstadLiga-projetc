
import './Jugadores.css'

function Jugadores() {
  return (
    <section className="seccion-contenido pagina-estadisticas">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">TEMPORADA ACTUAL</span>
          <h2>Estadísticas de jugadores</h2>
        </div>
        <p>LaLiga · Primera División</p>
      </div>

      <p className="introduccion-estadisticas">
        Consulta las clasificaciones individuales de la competición.
      </p>

      <div className="rejilla-estadisticas">
        <article className="tarjeta-estadistica">
          <div className="estadistica-icono">⚽</div>
          <span className="estadistica-etiqueta">GOLES</span>
          <h3>Máximos goleadores</h3>
          <p className="estadistica-pendiente">
            Estadísticas pendientes de conectar
          </p>
          <div className="puestos-pendientes">
            <span>1.º <b>Por determinar</b></span>
            <span>2.º <b>Por determinar</b></span>
            <span>3.º <b>Por determinar</b></span>
          </div>
        </article>

        <article className="tarjeta-estadistica">
          <div className="estadistica-icono">🎯</div>
          <span className="estadistica-etiqueta">ASISTENCIAS</span>
          <h3>Máximos asistentes</h3>
          <p className="estadistica-pendiente">
            Estadísticas pendientes de conectar
          </p>
          <div className="puestos-pendientes">
            <span>1.º <b>Por determinar</b></span>
            <span>2.º <b>Por determinar</b></span>
            <span>3.º <b>Por determinar</b></span>
          </div>
        </article>

        <article className="tarjeta-estadistica">
          <div className="estadistica-icono">⏱️</div>
          <span className="estadistica-etiqueta">PARTICIPACIÓN</span>
          <h3>Más partidos jugados</h3>
          <p className="estadistica-pendiente">
            Estadísticas pendientes de conectar
          </p>
          <div className="puestos-pendientes">
            <span>1.º <b>Por determinar</b></span>
            <span>2.º <b>Por determinar</b></span>
            <span>3.º <b>Por determinar</b></span>
          </div>
        </article>
      </div>

      <p className="aviso-estadisticas">
        Los puestos se completarán cuando conectemos la fuente de
        estadísticas de la temporada. No mostramos cifras inventadas.
      </p>
    </section>
  )
}

export default Jugadores
