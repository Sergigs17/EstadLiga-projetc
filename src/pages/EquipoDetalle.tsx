
import { useEffect, useState } from 'react'
import './EquipoDetalle.css'
import '../components/equipos/EquipoComponentes.css'

import type { Equipo } from './Equipos'
import CabeceraEquipo from '../components/equipos/CabeceraEquipo'
import HistoriaEquipo from '../components/equipos/HistoriaEquipo'
import PalmaresEquipo from '../components/equipos/PalmaresEquipo'
import PlantillaEquipo from '../components/equipos/PlantillaEquipo'
import EstadisticasEquipo from '../components/equipos/EstadisticasEquipo'
import { estilosClub } from '../utils/clubes'

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
  api_id: number | null
}

interface EquipoDetalleProps {
  equipo: Equipo | undefined
  jugadores: Jugador[]
  cargando: boolean
  error: boolean
}

type SeccionEquipo =
  | 'historia'
  | 'palmares'
  | 'jugadores'
  | 'estadisticas'

function EquipoDetalle({
  equipo,
  jugadores,
  cargando,
  error,
}: EquipoDetalleProps) {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionEquipo>('historia')

  // Al cambiar de equipo, volvemos a mostrar su historia.
  useEffect(() => {
    setSeccionActiva('historia')
  }, [equipo?.id])

  return (
    <section
      className="seccion-contenido pagina-plantilla"
      style={estilosClub(equipo?.nombre)}
    >
      <a className="volver-enlace" href="#/equipos">
        ← Volver a los equipos
      </a>

      <CabeceraEquipo equipo={equipo} />

      {equipo && (
        <>
          <nav
            className="menu-secciones-equipo"
            aria-label="Secciones del equipo"
          >
            <button
              type="button"
              className={seccionActiva === 'historia' ? 'activo' : ''}
              aria-current={
                seccionActiva === 'historia' ? 'page' : undefined
              }
              onClick={() => setSeccionActiva('historia')}
            >
              Historia
            </button>

            <button
              type="button"
              className={seccionActiva === 'palmares' ? 'activo' : ''}
              aria-current={
                seccionActiva === 'palmares' ? 'page' : undefined
              }
              onClick={() => setSeccionActiva('palmares')}
            >
              Palmarés
            </button>

            <button
              type="button"
              className={seccionActiva === 'jugadores' ? 'activo' : ''}
              aria-current={
                seccionActiva === 'jugadores' ? 'page' : undefined
              }
              onClick={() => setSeccionActiva('jugadores')}
            >
              Jugadores
            </button>

            <button
              type="button"
              className={seccionActiva === 'estadisticas' ? 'activo' : ''}
              aria-current={
                seccionActiva === 'estadisticas' ? 'page' : undefined
              }
              onClick={() => setSeccionActiva('estadisticas')}
            >
              Estadísticas
            </button>
          </nav>

          <div className="contenido-seccion-equipo">
            {seccionActiva === 'historia' && (
              <HistoriaEquipo equipo={equipo} />
            )}

            {seccionActiva === 'palmares' && (
              <PalmaresEquipo equipo={equipo} />
            )}

            {seccionActiva === 'jugadores' && (
              <PlantillaEquipo
                jugadores={jugadores}
                cargando={cargando}
                error={error}
              />
            )}

            {seccionActiva === 'estadisticas' && (
              <EstadisticasEquipo equipo={equipo} />
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default EquipoDetalle
