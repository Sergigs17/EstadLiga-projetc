import { useMemo, useState } from 'react'
import { estilosClub } from '../../utils/clubes'
import { EscudoClub, FotoJugador } from './PiezasJugador'
import {
  CATEGORIAS,
  RANKINGS,
  construirRanking,
  dato,
  ETIQUETA_POSICION,
  formatearNumero,
  grupoPosicion,
  maximoMinutos,
  nombreCompleto,
  nombreCorto,
  textoValor,
  type CategoriaId,
  type ContextoRanking,
  type DefinicionRanking,
  type GrupoPosicion,
  type JugadorStats,
} from './estadisticasJugadores'
import './TablasJugadores.css'

const FILAS_INICIALES = 5
const FILAS_AMPLIADAS = 15

/* ───────── Una clasificación ───────── */

function TarjetaRanking({
  def,
  jugadores,
  ctx,
}: {
  def: DefinicionRanking
  jugadores: JugadorStats[]
  ctx: ContextoRanking
}) {
  const [ampliada, setAmpliada] = useState(false)

  const filas = useMemo(
    () => construirRanking(def, jugadores, ctx),
    [def, jugadores, ctx],
  )

  const lider = filas[0]
  const empateEnCabeza = filas.length > 1 && filas[1].valor === lider?.valor
  const limite = ampliada ? FILAS_AMPLIADAS : FILAS_INICIALES
  const resto = filas.slice(1, limite)

  // Para las barras: con "menos es mejor" el líder tiene la barra más llena.
  const maximo = filas.length > 0 ? Math.max(...filas.map((f) => f.valor)) : 1
  const minimo = filas.length > 0 ? Math.min(...filas.map((f) => f.valor)) : 0

  const proporcion = (valor: number) => {
    if (def.menorEsMejor) {
      return maximo === minimo ? 100 : 30 + (1 - (valor - minimo) / (maximo - minimo)) * 70
    }
    return maximo > 0 ? Math.max(6, (valor / maximo) * 100) : 0
  }

  return (
    <article className="tj-tarjeta">
      <header className="tj-tarjeta-cabecera">
        <span className="tj-tarjeta-icono" aria-hidden="true">{def.icono}</span>
        <div>
          <h3>{def.titulo}</h3>
          <p>{def.descripcion}</p>
        </div>
      </header>

      {!lider ? (
        <p className="tj-vacio">
          Todavía no hay datos suficientes para esta clasificación.
        </p>
      ) : (
        <>
          <a
            className="tj-lider"
            href={`#/jugadores/${lider.jugador.id}`}
            style={estilosClub(lider.jugador.equipo)}
          >
            <FotoJugador jugador={lider.jugador} className="tj-lider-foto" />

            <div className="tj-lider-datos">
              <span className="tj-lider-etiqueta">
                {empateEnCabeza ? '👑 Líder · empatado' : '👑 Líder'}
              </span>
              <strong>{nombreCompleto(lider.jugador)}</strong>
              <span className="tj-lider-equipo">
                <EscudoClub equipo={lider.jugador.equipo} />
                {lider.jugador.equipo}
              </span>
            </div>

            <span className="tj-lider-valor">{textoValor(def, lider.valor)}</span>
          </a>

          {resto.length > 0 && (
            <ol className="tj-lista" start={2}>
              {resto.map((fila) => (
                <li key={fila.jugador.id} style={estilosClub(fila.jugador.equipo)}>
                  <a href={`#/jugadores/${fila.jugador.id}`}>
                    <span className="tj-puesto">{fila.puesto}</span>
                    <EscudoClub equipo={fila.jugador.equipo} />
                    <span className="tj-nombre">
                      <b>{nombreCorto(fila.jugador)}</b>
                      <small>{fila.jugador.equipo}</small>
                    </span>
                    <span className="tj-valor">{textoValor(def, fila.valor)}</span>
                    <span className="tj-barra" aria-hidden="true">
                      <i style={{ width: `${proporcion(fila.valor)}%` }} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}

          <footer className="tj-pie">
            {def.requisito && <small>{def.requisito(ctx)}</small>}

            {filas.length > FILAS_INICIALES && (
              <button
                type="button"
                className="tj-ver-mas"
                onClick={() => setAmpliada((valor) => !valor)}
                aria-expanded={ampliada}
              >
                {ampliada ? 'Ver menos' : `Ver top ${Math.min(FILAS_AMPLIADAS, filas.length)}`}
              </button>
            )}
          </footer>
        </>
      )}
    </article>
  )
}

/* ───────── Página de clasificaciones ───────── */

const POSICIONES: { id: GrupoPosicion | 'todas'; etiqueta: string }[] = [
  { id: 'todas', etiqueta: 'Todas las posiciones' },
  { id: 'portero', etiqueta: ETIQUETA_POSICION.portero + 's' },
  { id: 'defensa', etiqueta: ETIQUETA_POSICION.defensa + 's' },
  { id: 'medio', etiqueta: ETIQUETA_POSICION.medio + 's' },
  { id: 'delantero', etiqueta: ETIQUETA_POSICION.delantero + 's' },
]

function TablasJugadores({ jugadores }: { jugadores: JugadorStats[] }) {
  const [categoria, setCategoria] = useState<CategoriaId>('ataque')
  const [equipo, setEquipo] = useState('todos')
  const [posicion, setPosicion] = useState<GrupoPosicion | 'todas'>('todas')

  const equipos = useMemo(
    () =>
      Array.from(new Set(jugadores.map((j) => j.equipo).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, 'es'),
      ),
    [jugadores],
  )

  // El mínimo de minutos se calcula con TODOS los jugadores: así las medias
  // no cambian de criterio al filtrar por equipo o posición.
  const ctx = useMemo<ContextoRanking>(
    () => ({ minMinutos: Math.max(90, Math.round(maximoMinutos(jugadores) * 0.25)) }),
    [jugadores],
  )

  // En Portería solo hay porteros, así que la posición queda fijada.
  const soloPorteros = categoria === 'porteria'
  const posicionEfectiva = soloPorteros ? 'portero' : posicion

  const filtrados = useMemo(
    () =>
      jugadores.filter(
        (j) =>
          (equipo === 'todos' || j.equipo === equipo) &&
          (posicionEfectiva === 'todas' ||
            grupoPosicion(j.posicion) === posicionEfectiva),
      ),
    [jugadores, equipo, posicionEfectiva],
  )

  const resumen = useMemo(() => {
    const suma = (clave: string) =>
      jugadores.reduce((acumulado, j) => acumulado + (dato(j.stats, clave) ?? 0), 0)

    return {
      jugadores: jugadores.length,
      goles: suma('goals'),
      asistencias: suma('assists'),
      tarjetas: suma('yellowCards') + suma('redCards'),
    }
  }, [jugadores])

  const rankings = RANKINGS.filter((r) => r.categoria === categoria)

  return (
    <div className="tj">
      <div className="tj-resumen">
        <div className="tj-kpi tj-kpi-destacado">
          <span>Jugadores analizados</span>
          <strong>{formatearNumero(resumen.jugadores)}</strong>
        </div>
        <div className="tj-kpi">
          <span>Goles</span>
          <strong>{formatearNumero(resumen.goles)}</strong>
        </div>
        <div className="tj-kpi">
          <span>Asistencias</span>
          <strong>{formatearNumero(resumen.asistencias)}</strong>
        </div>
        <div className="tj-kpi">
          <span>Tarjetas</span>
          <strong>{formatearNumero(resumen.tarjetas)}</strong>
        </div>
      </div>

      <div className="tj-categorias" role="tablist" aria-label="Categoría de clasificación">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={categoria === c.id}
            className={categoria === c.id ? 'activa' : ''}
            onClick={() => setCategoria(c.id)}
          >
            <span aria-hidden="true">{c.icono}</span> {c.etiqueta}
          </button>
        ))}
      </div>

      <div className="tj-filtros">
        <label>
          <span>Equipo</span>
          <select value={equipo} onChange={(e) => setEquipo(e.target.value)}>
            <option value="todos">Todos los equipos</option>
            {equipos.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Posición</span>
          <select
            value={posicionEfectiva}
            disabled={soloPorteros}
            onChange={(e) => setPosicion(e.target.value as GrupoPosicion | 'todas')}
          >
            {POSICIONES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <p>
          {filtrados.length} {filtrados.length === 1 ? 'jugador' : 'jugadores'} en la selección
        </p>
      </div>

      <div className="tj-rejilla">
        {rankings.map((def) => (
          <TarjetaRanking key={def.id} def={def} jugadores={filtrados} ctx={ctx} />
        ))}
      </div>
    </div>
  )
}

export default TablasJugadores