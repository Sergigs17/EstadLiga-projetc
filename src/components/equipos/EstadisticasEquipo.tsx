import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Equipo } from '../../pages/Equipos'
import './EstadisticasEquipo.css'

const TORNEO_LALIGA = 8
const TEMPORADA_ACTUAL = 97268

type Estadisticas = Record<string, number | string | null>

interface RespuestaEstadisticas {
  equipo: {
    id: number
    nombre: string
  }
  unique_tournament_id: number
  season_id: number
  origen: string
  actualizado_en: string
  datos: {
    statistics?: Estadisticas
  }
}

interface EstadisticasEquipoProps {
  equipo: Equipo
}

/* ───────── Utilidades ───────── */

function aNumero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

function formato(
  valor: number | null,
  decimales = 0,
  sufijo = '',
): string {
  if (valor === null) return '—'

  return `${valor.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  })}${sufijo}`
}

function limitar(valor: number, minimo = 0, maximo = 100): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

/* ───────── Piezas gráficas ───────── */

const RADIO = 44
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

function Anillo({
  valor,
  etiqueta,
  detalle,
}: {
  valor: number
  etiqueta: string
  detalle?: string
}) {
  const porcentaje = limitar(valor)

  return (
    <div className="es-anillo">
      <svg viewBox="0 0 110 110" role="img" aria-label={`${etiqueta}: ${formato(valor, 1)} %`}>
        <circle className="es-anillo-fondo" cx="55" cy="55" r={RADIO} />
        <circle
          className="es-anillo-valor"
          cx="55"
          cy="55"
          r={RADIO}
          strokeDasharray={`${(porcentaje / 100) * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="61" textAnchor="middle" className="es-anillo-texto">
          {formato(valor, 1)}%
        </text>
      </svg>
      <strong>{etiqueta}</strong>
      {detalle && <span>{detalle}</span>}
    </div>
  )
}

function Panel({
  titulo,
  descripcion,
  children,
  clase = '',
}: {
  titulo: string
  descripcion?: string
  children: ReactNode
  clase?: string
}) {
  return (
    <article className={`es-panel ${clase}`.trim()}>
      <header>
        <h3>{titulo}</h3>
        {descripcion && <p>{descripcion}</p>}
      </header>
      {children}
    </article>
  )
}

function BarraComparada({
  etiqueta,
  valor,
  maximo,
  texto,
  clase = '',
}: {
  etiqueta: string
  valor: number
  maximo: number
  texto: string
  clase?: string
}) {
  const ancho = maximo > 0 ? limitar((valor / maximo) * 100) : 0

  return (
    <div className={`es-barra ${clase}`.trim()}>
      <div className="es-barra-texto">
        <span>{etiqueta}</span>
        <strong>{texto}</strong>
      </div>
      <div className="es-barra-pista">
        <i style={{ width: `${ancho}%` }} />
      </div>
    </div>
  )
}

/* ───────── Componente principal ───────── */

function EstadisticasEquipo({ equipo }: EstadisticasEquipoProps) {
  const [estadisticas, setEstadisticas] =
    useState<RespuestaEstadisticas | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarEstadisticas() {
      setCargando(true)
      setError(false)
      setEstadisticas(null)

      try {
        const respuesta = await fetch(
          `/api/equipos/${equipo.id}/estadisticas?unique_tournament_id=${TORNEO_LALIGA}&season_id=${TEMPORADA_ACTUAL}`,
          { signal: controlador.signal },
        )

        if (!respuesta.ok) {
          throw new Error('No se han encontrado estadísticas para este equipo')
        }

        const datos = (await respuesta.json()) as RespuestaEstadisticas

        if (!datos.datos?.statistics) {
          throw new Error('La respuesta no contiene estadísticas')
        }

        setEstadisticas(datos)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError(true)
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargarEstadisticas()

    return () => controlador.abort()
  }, [equipo.id, intento])

  const s = estadisticas?.datos.statistics ?? {}
  const dato = (clave: string) => aNumero(s[clave])

  const partidos = dato('matches')
  const porPartido = (valor: number | null, decimales = 1) =>
    valor !== null && partidos ? formato(valor / partidos, decimales) : null

  const golesFavor = dato('goalsScored')
  const golesContra = dato('goalsConceded')
  const posesion = dato('averageBallPossession')
  const xg = dato('expectedGoals')
  const tiros = dato('shots')
  const alPalo = dato('shotsOnTarget')
  const pasesTotales = dato('totalPasses')
  const pasesAcertados = dato('accuratePasses')
  const precisionPase = dato('accuratePassesPercentage')
  const precisionLargos = dato('accurateLongBallsPercentage')
  const porteriasCero = dato('cleanSheets')
  const amarillas = dato('yellowCards')
  const rojas = dato('redCards')
  const faltas = dato('fouls')

  const accionesDefensivas = [
    { etiqueta: 'Recuperaciones', valor: dato('ballRecovery') },
    { etiqueta: 'Despejes', valor: dato('clearances') },
    { etiqueta: 'Entradas', valor: dato('tackles') },
    { etiqueta: 'Intercepciones', valor: dato('interceptions') },
    { etiqueta: 'Paradas', valor: dato('saves') },
  ]
    .filter(
      (accion): accion is { etiqueta: string; valor: number } =>
        accion.valor !== null,
    )
    .sort((a, b) => b.valor - a.valor)

  const maximoAccion = accionesDefensivas[0]?.valor ?? 1
  const diferenciaXg =
    golesFavor !== null && xg !== null ? golesFavor - xg : null
  const totalGoles = (golesFavor ?? 0) + (golesContra ?? 0)

  const fichasAtaque = [
    { etiqueta: 'Grandes ocasiones', valor: dato('bigChances'), icono: '🎯' },
    { etiqueta: 'Asistencias', valor: dato('assists'), icono: '🤝' },
    { etiqueta: 'Pases clave', valor: dato('keyPasses'), icono: '🔑' },
    { etiqueta: 'Saques de esquina', valor: dato('corners'), icono: '🚩' },
  ].filter(
    (ficha): ficha is { etiqueta: string; valor: number; icono: string } =>
      ficha.valor !== null,
  )

  const hayAtaque = tiros !== null || golesFavor !== null
  const hayPases =
    posesion !== null || precisionPase !== null || precisionLargos !== null
  const hayDefensa = accionesDefensivas.length > 0 || porteriasCero !== null
  const hayDisciplina =
    amarillas !== null || rojas !== null || faltas !== null

  return (
    <section className="seccion-estadisticas-equipo">
      <header className="estadisticas-cabecera">
        <div>
          <span className="subtitulo">TEMPORADA 2026/27</span>
          <h2>Estadísticas del equipo</h2>
          <p>Rendimiento de {equipo.nombre} en LaLiga.</p>
        </div>

        {estadisticas && partidos !== null && (
          <span className="estadisticas-partidos">
            {formato(partidos)} partidos
          </span>
        )}
      </header>

      {cargando && (
        <div className="estadisticas-mensaje" role="status">
          <span className="estadisticas-cargando-icono" aria-hidden="true">
            ⚽
          </span>
          <p>Cargando estadísticas del equipo...</p>
        </div>
      )}

      {error && !cargando && (
        <div className="estadisticas-mensaje" role="alert">
          <h3>Estadísticas no disponibles</h3>
          <p>
            No hemos podido cargar los datos de este equipo. Inténtalo de
            nuevo más tarde.
          </p>
          <button type="button" onClick={() => setIntento((n) => n + 1)}>
            Volver a intentar
          </button>
        </div>
      )}

      {estadisticas && !cargando && (
        <>
          {/* ───── Resumen ───── */}
          <div className="es-resumen">
            <div className="es-kpi es-kpi-destacado">
              <span>Goles a favor</span>
              <strong>{formato(golesFavor)}</strong>
              {porPartido(golesFavor) && <small>{porPartido(golesFavor)} por partido</small>}
            </div>

            <div className="es-kpi">
              <span>Goles en contra</span>
              <strong>{formato(golesContra)}</strong>
              {porPartido(golesContra) && <small>{porPartido(golesContra)} por partido</small>}
            </div>

            {posesion !== null && (
              <div className="es-kpi es-kpi-anillo">
                <Anillo valor={posesion} etiqueta="Posesión media" />
              </div>
            )}

            {xg !== null && (
              <div className="es-kpi">
                <span>Goles esperados (xG)</span>
                <strong>{formato(xg, 1)}</strong>
                {diferenciaXg !== null && (
                  <small
                    className={diferenciaXg >= 0 ? 'es-positivo' : 'es-negativo'}
                  >
                    {diferenciaXg >= 0 ? '▲' : '▼'} {formato(Math.abs(diferenciaXg), 1)}{' '}
                    {diferenciaXg >= 0 ? 'sobre' : 'bajo'} lo esperado
                  </small>
                )}
              </div>
            )}
          </div>

          {golesFavor !== null && golesContra !== null && totalGoles > 0 && (
            <div className="es-balance" role="img" aria-label={`Balance de goles: ${golesFavor} a favor y ${golesContra} en contra`}>
              <div className="es-balance-barra">
                <span style={{ flexGrow: golesFavor || 0.0001 }}>{golesFavor}</span>
                <span style={{ flexGrow: golesContra || 0.0001 }}>{golesContra}</span>
              </div>
              <div className="es-balance-texto">
                <span>A favor</span>
                <strong>
                  Diferencia {golesFavor - golesContra > 0 ? '+' : ''}
                  {golesFavor - golesContra}
                </strong>
                <span>En contra</span>
              </div>
            </div>
          )}

          {/* ───── Ataque ───── */}
          {hayAtaque && (
            <section className="es-seccion">
              <h3 className="es-titulo">⚽ Ataque</h3>

              <div className="es-rejilla es-rejilla-2">
                {tiros !== null && (
                  <Panel
                    titulo="Embudo de tiros"
                    descripcion="De cada intento a la red"
                  >
                    <div className="es-embudo">
                      <div className="es-embudo-paso" style={{ '--ancho': '100%' } as CSSProperties}>
                        <span>Tiros totales</span>
                        <strong>{formato(tiros)}</strong>
                      </div>

                      {alPalo !== null && (
                        <div
                          className="es-embudo-paso"
                          style={{ '--ancho': `${limitar((alPalo / tiros) * 100, 18)}%` } as CSSProperties}
                        >
                          <span>A puerta</span>
                          <strong>{formato(alPalo)}</strong>
                          <small>{formato((alPalo / tiros) * 100, 0)} % de los tiros</small>
                        </div>
                      )}

                      {golesFavor !== null && (
                        <div
                          className="es-embudo-paso"
                          style={{ '--ancho': `${limitar((golesFavor / tiros) * 100, 18)}%` } as CSSProperties}
                        >
                          <span>Goles</span>
                          <strong>{formato(golesFavor)}</strong>
                          <small>
                            1 gol cada {golesFavor > 0 ? formato(tiros / golesFavor, 1) : '—'} tiros
                          </small>
                        </div>
                      )}
                    </div>
                  </Panel>
                )}

                {golesFavor !== null && xg !== null && (
                  <Panel
                    titulo="Goles frente a lo esperado"
                    descripcion="Si el equipo marca más o menos de lo que merecen sus ocasiones"
                  >
                    <div className="es-barras">
                      <BarraComparada
                        etiqueta="Goles marcados"
                        valor={golesFavor}
                        maximo={Math.max(golesFavor, xg)}
                        texto={formato(golesFavor)}
                      />
                      <BarraComparada
                        etiqueta="Goles esperados (xG)"
                        valor={xg}
                        maximo={Math.max(golesFavor, xg)}
                        texto={formato(xg, 1)}
                        clase="es-barra-suave"
                      />
                    </div>

                    {diferenciaXg !== null && (
                      <p className={`es-veredicto ${diferenciaXg >= 0 ? 'es-positivo' : 'es-negativo'}`}>
                        {diferenciaXg >= 0
                          ? `Marca ${formato(diferenciaXg, 1)} goles más de lo esperado: es eficaz de cara a puerta.`
                          : `Marca ${formato(Math.abs(diferenciaXg), 1)} goles menos de lo esperado: le falta acierto.`}
                      </p>
                    )}
                  </Panel>
                )}
              </div>

              {fichasAtaque.length > 0 && (
                <div className="es-fichas">
                  {fichasAtaque.map((ficha) => (
                    <div className="es-ficha" key={ficha.etiqueta}>
                      <span className="es-ficha-icono" aria-hidden="true">{ficha.icono}</span>
                      <strong>{formato(ficha.valor)}</strong>
                      <span>{ficha.etiqueta}</span>
                      {porPartido(ficha.valor) && <small>{porPartido(ficha.valor)} por partido</small>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ───── Posesión y pases ───── */}
          {hayPases && (
            <section className="es-seccion">
              <h3 className="es-titulo">🎛️ Posesión y pases</h3>

              <div className="es-panel es-anillos">
                {posesion !== null && (
                  <Anillo valor={posesion} etiqueta="Posesión" detalle="del tiempo con balón" />
                )}
                {precisionPase !== null && (
                  <Anillo valor={precisionPase} etiqueta="Precisión de pase" detalle="pases acertados" />
                )}
                {precisionLargos !== null && (
                  <Anillo valor={precisionLargos} etiqueta="Pases largos" detalle="acertados" />
                )}
              </div>

              {pasesTotales !== null && pasesAcertados !== null && pasesTotales > 0 && (
                <Panel titulo="Pases" descripcion="Intentados y acertados">
                  <BarraComparada
                    etiqueta="Acertados"
                    valor={pasesAcertados}
                    maximo={pasesTotales}
                    texto={`${formato(pasesAcertados)} de ${formato(pasesTotales)}`}
                  />
                </Panel>
              )}
            </section>
          )}

          {/* ───── Defensa ───── */}
          {hayDefensa && (
            <section className="es-seccion">
              <h3 className="es-titulo">🛡️ Defensa</h3>

              <div className="es-rejilla es-rejilla-2">
                {accionesDefensivas.length > 0 && (
                  <Panel
                    titulo="Acciones defensivas"
                    descripcion="Total de la temporada, de más a menos"
                  >
                    <div className="es-barras">
                      {accionesDefensivas.map((accion) => (
                        <BarraComparada
                          key={accion.etiqueta}
                          etiqueta={accion.etiqueta}
                          valor={accion.valor}
                          maximo={maximoAccion}
                          texto={`${formato(accion.valor)}${porPartido(accion.valor) ? ` · ${porPartido(accion.valor)}/partido` : ''}`}
                        />
                      ))}
                    </div>
                  </Panel>
                )}

                {porteriasCero !== null && (
                  <Panel
                    titulo="Porterías a cero"
                    descripcion="Partidos sin encajar gol"
                  >
                    <div className="es-escudo-cero">
                      <strong>{formato(porteriasCero)}</strong>
                      {partidos !== null && <span>de {formato(partidos)} partidos</span>}
                    </div>

                    {partidos !== null && partidos > 0 && partidos <= 38 && (
                      <div className="es-puntos-partido" aria-hidden="true">
                        {Array.from({ length: partidos }, (_, i) => (
                          <i key={i} className={i < porteriasCero ? 'activo' : ''} />
                        ))}
                      </div>
                    )}

                    {dato('goalsPrevented') !== null && (
                      <p className="es-veredicto">
                        Goles evitados por los porteros:{' '}
                        <b>{formato(dato('goalsPrevented'), 1)}</b>
                      </p>
                    )}
                  </Panel>
                )}
              </div>
            </section>
          )}

          {/* ───── Disciplina ───── */}
          {hayDisciplina && (
            <section className="es-seccion">
              <h3 className="es-titulo">🟨 Disciplina</h3>

              <div className="es-disciplina">
                {amarillas !== null && (
                  <div className="es-tarjeta-cartulina">
                    <i className="es-cartulina es-amarilla" />
                    <strong>{formato(amarillas)}</strong>
                    <span>Amarillas</span>
                    {porPartido(amarillas) && <small>{porPartido(amarillas)} por partido</small>}
                  </div>
                )}

                {rojas !== null && (
                  <div className="es-tarjeta-cartulina">
                    <i className="es-cartulina es-roja" />
                    <strong>{formato(rojas)}</strong>
                    <span>Rojas</span>
                    {porPartido(rojas, 2) && <small>{porPartido(rojas, 2)} por partido</small>}
                  </div>
                )}

                <div className="es-otros">
                  {faltas !== null && (
                    <BarraComparada
                      etiqueta="Faltas cometidas"
                      valor={faltas}
                      maximo={Math.max(faltas, 1)}
                      texto={`${formato(faltas)}${porPartido(faltas) ? ` · ${porPartido(faltas)}/partido` : ''}`}
                      clase="es-barra-suave"
                    />
                  )}
                  {dato('offsides') !== null && (
                    <p>
                      <span>Fueras de juego</span>
                      <b>{formato(dato('offsides'))}</b>
                    </p>
                  )}
                  {dato('penaltiesCommited') !== null && (
                    <p>
                      <span>Penaltis cometidos</span>
                      <b>{formato(dato('penaltiesCommited'))}</b>
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          <p className="estadisticas-pie">
            Datos de LaLiga · Temporada 2026/27
            {estadisticas.actualizado_en && (
              <> · Actualizado el {estadisticas.actualizado_en}</>
            )}
          </p>
        </>
      )}
    </section>
  )
}

export default EstadisticasEquipo
