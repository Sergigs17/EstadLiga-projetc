
import './Equipos.css'

export interface Equipo {
  id: number
  nombre: string
  escudo: string | null
  entrenador: string | null
  estadio: string | null
  ciudad: string | null
}

interface EquiposProps {
  equipos: Equipo[]
  cargando: boolean
  error: boolean
}

function Equipos({ equipos, cargando, error }: EquiposProps) {
  return (
    <section className="seccion-contenido pagina-equipos">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">PRIMERA DIVISIÓN</span>
          <h2>Equipos de LaLiga</h2>
        </div>
        <p>{equipos.length} clubes</p>
      </div>

      {cargando && <p>Cargando equipos...</p>}

      {error && (
        <p>
          No se han podido cargar los equipos. Inténtalo más tarde.
        </p>
      )}

      {!cargando && !error && equipos.length === 0 && (
        <div className="mensaje-vacio">
          <span>⚽</span>
          <h3>No hay equipos disponibles</h3>
          <p>Actualmente no tenemos equipos para mostrar.</p>
        </div>
      )}

      {!cargando && !error && equipos.length > 0 && (
        <div className="rejilla-equipos">
          {equipos.map((equipo) => (
            <a
              className="tarjeta-equipo"
              key={equipo.id}
              href={`#/equipos/${equipo.id}`}
            >
              {equipo.escudo ? (
                <img
                  src={equipo.escudo}
                  alt={`Escudo del ${equipo.nombre}`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="escudo-pendiente">⚽</div>
              )}

              <h3>{equipo.nombre}</h3>

              {equipo.estadio && <p>{equipo.estadio}</p>}
              {equipo.ciudad && <p>{equipo.ciudad}</p>}

              <span className="enlace-plantilla">
                Ver plantilla →
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

export default Equipos
