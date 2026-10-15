
import './EquipoDetalle.css'
import type { Equipo } from './Equipos'

export interface Jugador {
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

interface EquipoDetalleProps {
  equipo: Equipo | undefined
  jugadores: Jugador[]
  cargando: boolean
  error: boolean
}

function EquipoDetalle({
  equipo,
  jugadores,
  cargando,
  error,
}: EquipoDetalleProps) {
  return (
    <section className="seccion-contenido pagina-plantilla">
      <a className="volver-enlace" href="#/equipos">
        ← Volver a los equipos
      </a>

      {equipo ? (
        <div className="cabecera-plantilla">
          {equipo.escudo && (
            <img
              src={equipo.escudo}
              alt={`Escudo del ${equipo.nombre}`}
            />
          )}

          <div>
            <span className="subtitulo">PLANTILLA DEL CLUB</span>
            <h1>{equipo.nombre}</h1>

            {equipo.estadio && <p>Estadio: {equipo.estadio}</p>}
            {equipo.ciudad && <p>Ciudad: {equipo.ciudad}</p>}
          </div>
        </div>
      ) : (
        <div className="equipo-no-encontrado">
          <h1>Equipo no encontrado</h1>
          <p>No hemos encontrado este equipo en nuestra base de datos.</p>
        </div>
      )}

      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">JUGADORES</span>
          <h2>Primera plantilla</h2>
        </div>
        <p>{jugadores.length} jugadores</p>
      </div>

      {cargando && <p>Cargando plantilla...</p>}

      {error && <p>No se ha podido cargar esta plantilla.</p>}

      {!cargando && !error && jugadores.length === 0 && (
        <div className="mensaje-vacio">
          <span>⚽</span>
          <h3>Plantilla todavía no disponible</h3>
          <p>Aún no tenemos jugadores guardados para este equipo.</p>
        </div>
      )}

      {!cargando && !error && jugadores.length > 0 && (
        <div className="rejilla-jugadores">
          {jugadores.map((jugador) => (
            <article className="tarjeta-jugador" key={jugador.id}>
              <div className="jugador-dorsal">
                {jugador.dorsal ?? '—'}
              </div>

              <div className="jugador-informacion">
                <span className="jugador-equipo">{jugador.equipo}</span>
                <h3>
                  {jugador.nombre} {jugador.apellido ?? ''}
                </h3>
                <p>{jugador.posicion ?? 'Posición desconocida'}</p>
                <p>
                  {jugador.nacionalidad ?? 'Nacionalidad desconocida'}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default EquipoDetalle
