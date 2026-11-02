import { useEffect, useState } from 'react'
import ComparadorJugadores from '../components/jugadores/ComparadorJugadores'
import TablasJugadores from '../components/jugadores/TablasJugadores'
import {
  TEMPORADA_ACTUAL,
  TORNEO_LALIGA,
  fechaCorta,
  type JugadorStats,
  type RespuestaJugadoresStats,
} from '../components/jugadores/estadisticasJugadores'
import './Jugadores.css'

type Pestana = 'clasificaciones' | 'comparador'

function Jugadores() {
  const [pestana, setPestana] = useState<Pestana>('clasificaciones')
  const [jugadores, setJugadores] = useState<JugadorStats[]>([])
  const [actualizado, setActualizado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Todas las estadísticas salen de lo que ya está guardado en la base de datos.
  useEffect(() => {
    const controlador = new AbortController()

    fetch(
      `/api/jugadores/estadisticas?unique_tournament_id=${TORNEO_LALIGA}&season_id=${TEMPORADA_ACTUAL}`,
      { signal: controlador.signal },
    )
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se han podido cargar las estadísticas')
        }

        return (await respuesta.json()) as RespuestaJugadoresStats
      })
      .then((datos) => {
        setJugadores(datos.jugadores ?? [])
        setActualizado(datos.actualizado_en)
      })
      .catch((fallo: unknown) => {
        if (fallo instanceof DOMException && fallo.name === 'AbortError') return

        setError(
          fallo instanceof Error
            ? fallo.message
            : 'No se han podido cargar las estadísticas',
        )
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false)
      })

    return () => controlador.abort()
  }, [])

  const fecha = fechaCorta(actualizado)

  return (
    <section className="seccion-contenido pagina-estadisticas">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">TEMPORADA ACTUAL</span>
          <h2>Estadísticas de jugadores</h2>
        </div>
        <p>LaLiga · Primera División</p>
      </div>

      <div className="pestanas-jugadores" role="tablist" aria-label="Sección de jugadores">
        <button
          type="button"
          role="tab"
          aria-selected={pestana === 'clasificaciones'}
          className={pestana === 'clasificaciones' ? 'activa' : ''}
          onClick={() => setPestana('clasificaciones')}
        >
          🏆 Clasificaciones
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestana === 'comparador'}
          className={pestana === 'comparador' ? 'activa' : ''}
          onClick={() => setPestana('comparador')}
        >
          ⚖️ Comparador
        </button>
      </div>

      {cargando && <p className="estado-jugadores">Cargando estadísticas…</p>}

      {!cargando && error && (
        <p className="estado-jugadores estado-error" role="alert">
          {error}. Comprueba que el servidor está activo e inténtalo de nuevo.
        </p>
      )}

      {!cargando && !error && jugadores.length === 0 && (
        <div className="estado-jugadores">
          <strong>Todavía no hay estadísticas guardadas</strong>
          <p>
            Cuando importes las estadísticas de los jugadores a la base de datos, aparecerán aquí
            automáticamente.
          </p>
        </div>
      )}

      {!cargando && !error && jugadores.length > 0 && (
        <>
          {pestana === 'clasificaciones' ? (
            <TablasJugadores jugadores={jugadores} />
          ) : (
            <ComparadorJugadores jugadores={jugadores} />
          )}

          <p className="aviso-estadisticas">
            Datos de {jugadores.length} jugadores guardados en EstadLiga
            {fecha && <> · Última actualización: {fecha}</>}. Solo se muestran cifras reales; en las
            clasificaciones no aparecen los jugadores con valor cero.
          </p>
        </>
      )}
    </section>
  )
}

export default Jugadores
