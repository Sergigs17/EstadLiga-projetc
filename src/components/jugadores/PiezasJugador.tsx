import { useState } from 'react'
import { obtenerSlugClub } from '../../utils/clubes'
import { iniciales, type JugadorStats, nombreCompleto } from './estadisticasJugadores'

/** Foto del jugador. Si no existe, muestra sus iniciales. */
export function FotoJugador({
  jugador,
  className = '',
}: {
  jugador: JugadorStats
  className?: string
}) {
  const [fallida, setFallida] = useState(false)
  const tieneId = jugador.api_id != null && Number(jugador.api_id) > 0

  if (!tieneId || fallida) {
    return (
      <span className={`foto-jugador foto-jugador-vacia ${className}`} aria-hidden="true">
        {iniciales(jugador)}
      </span>
    )
  }

  return (
    <span className={`foto-jugador ${className}`}>
      <img
        src={`/api/jugadores/${jugador.id}/imagen`}
        alt={`Foto de ${nombreCompleto(jugador)}`}
        loading="lazy"
        decoding="async"
        onError={() => setFallida(true)}
      />
    </span>
  )
}

/** Escudo del club a partir de su nombre. */
export function EscudoClub({
  equipo,
  className = '',
}: {
  equipo: string
  className?: string
}) {
  const [fallido, setFallido] = useState(false)
  const slug = obtenerSlugClub(equipo)

  if (!slug || fallido) {
    return <span className={`escudo-club escudo-club-vacio ${className}`} aria-hidden="true" />
  }

  return (
    <img
      className={`escudo-club ${className}`}
      src={`/escudos/${slug}.png`}
      alt=""
      loading="lazy"
      onError={() => setFallido(true)}
    />
  )
}