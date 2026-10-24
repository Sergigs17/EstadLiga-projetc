
import { useState } from 'react'
import type { Jugador } from '../../pages/EquipoDetalle'

interface PlantillaEquipoProps {
  jugadores: Jugador[]
  cargando: boolean
  error: boolean
}

function obtenerGrupo(posicion: string | null): number {
  const normalizada = (posicion ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (
    normalizada.includes('portero') ||
    normalizada.includes('goalkeeper') ||
    normalizada === 'g'
  ) {
    return 0
  }

  if (
    normalizada.includes('defensa') ||
    normalizada.includes('defender') ||
    normalizada.includes('back') ||
    normalizada === 'd'
  ) {
    return 1
  }

  if (
    normalizada.includes('centrocampista') ||
    normalizada.includes('mediocentro') ||
    normalizada.includes('mediapunta') ||
    normalizada.includes('medio') ||
    normalizada.includes('midfield') ||
    normalizada === 'm'
  ) {
    return 2
  }

  if (
    normalizada.includes('delantero') ||
    normalizada.includes('forward') ||
    normalizada.includes('attacker') ||
    normalizada.includes('striker') ||
    normalizada === 'f'
  ) {
    return 3
  }

  return 4
}

function TarjetaJugador({ jugador }: { jugador: Jugador }) {
  const [imagenFallida, setImagenFallida] = useState(false)

  const nombreCompleto =
    `${jugador.nombre} ${jugador.apellido ?? ''}`.trim()

  // La imagen se sirve desde nuestro Worker.
  // El Worker busca primero la fotografía en R2 y, si no existe,
  // la obtiene de Apify y la guarda para las próximas consultas.
  const tieneIdSofaScore =
    jugador.api_id != null &&
    Number.isInteger(Number(jugador.api_id)) &&
    Number(jugador.api_id) > 0

  const imagenJugador =
    tieneIdSofaScore && !imagenFallida
      ? `/api/jugadores/${jugador.id}/imagen`
      : null

  return (
    <a
      className="tarjeta-jugador"
      href={`#/jugadores/${jugador.id}`}
      aria-label={`Ver estadísticas de ${nombreCompleto}`}
    >
      <div className="jugador-foto">
        {imagenJugador ? (
          <img
            src={imagenJugador}
            alt={`Foto de ${nombreCompleto}`}
            loading="lazy"
            decoding="async"
            onError={() => setImagenFallida(true)}
          />
        ) : (
          <div
            className="jugador-foto-pendiente"
            aria-label="Foto no disponible"
          >
            <span aria-hidden="true">⚽</span>
          </div>
        )}
      </div>

      <div className="jugador-informacion">
        <span className="jugador-equipo">{jugador.equipo}</span>

        <h3>{nombreCompleto}</h3>

        <p>{jugador.posicion ?? 'Posición desconocida'}</p>

        <p>{jugador.nacionalidad ?? 'Nacionalidad desconocida'}</p>

        <span className="enlace-estadisticas-jugador">
          Ver estadísticas →
        </span>
      </div>
    </a>
  )
}

function PlantillaEquipo({
  jugadores,
  cargando,
  error,
}: PlantillaEquipoProps) {
  const grupos = [
    { titulo: 'Porteros', indice: 0 },
    { titulo: 'Defensas', indice: 1 },
    { titulo: 'Centrocampistas', indice: 2 },
    { titulo: 'Delanteros', indice: 3 },
  ].map((grupo) => ({
    ...grupo,
    jugadores: jugadores
      .filter(
        (jugador) => obtenerGrupo(jugador.posicion) === grupo.indice,
      )
      .sort((a, b) => {
        if (a.dorsal == null) return 1
        if (b.dorsal == null) return -1
        return a.dorsal - b.dorsal
      }),
  }))

  const sinPosicionReconocida = jugadores
    .filter((jugador) => obtenerGrupo(jugador.posicion) === 4)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  return (
    <section className="seccion-plantilla-equipo">
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
        <div className="grupos-plantilla">
          {grupos.map(
            (grupo) =>
              grupo.jugadores.length > 0 && (
                <section className="grupo-posicion" key={grupo.titulo}>
                  <div className="titulo-grupo-posicion">
                    <h3>{grupo.titulo}</h3>
                    <span>{grupo.jugadores.length}</span>
                  </div>

                  <div className="rejilla-jugadores">
                    {grupo.jugadores.map((jugador) => (
                      <TarjetaJugador
                        jugador={jugador}
                        key={jugador.id}
                      />
                    ))}
                  </div>
                </section>
              ),
          )}

          {sinPosicionReconocida.length > 0 && (
            <section className="grupo-posicion">
              <div className="titulo-grupo-posicion">
                <h3>Otros jugadores</h3>
                <span>{sinPosicionReconocida.length}</span>
              </div>

              <div className="rejilla-jugadores">
                {sinPosicionReconocida.map((jugador) => (
                  <TarjetaJugador
                    jugador={jugador}
                    key={jugador.id}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  )
}

export default PlantillaEquipo
