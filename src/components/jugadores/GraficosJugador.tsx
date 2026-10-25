import type { ReactNode } from 'react'
import './GraficosJugador.css'

type Estadisticas = Record<string, unknown>

interface GraficosJugadorProps {
  estadisticas: Estadisticas
  portero: boolean
}

/* ───────── Utilidades ───────── */

function num(datos: Estadisticas, clave: string): number | null {
  const valor = datos[clave]
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function fmt(valor: number | null, decimales = 1, sufijo = ''): string {
  if (valor === null) return '—'
  return `${valor.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  })}${sufijo}`
}

function limitar(valor: number, minimo = 0, maximo = 100): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

/* ───────── Anillo ───────── */

const RADIO = 44
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

function Anillo({
  porcentaje,
  texto,
  etiqueta,
  detalle,
}: {
  porcentaje: number
  texto: string
  etiqueta: string
  detalle?: string
}) {
  return (
    <div className="gj-anillo">
      <svg viewBox="0 0 110 110" role="img" aria-label={`${etiqueta}: ${texto}`}>
        <circle className="gj-anillo-fondo" cx="55" cy="55" r={RADIO} />
        <circle
          className="gj-anillo-valor"
          cx="55"
          cy="55"
          r={RADIO}
          strokeDasharray={`${(limitar(porcentaje) / 100) * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="62" textAnchor="middle" className="gj-anillo-texto">
          {texto}
        </text>
      </svg>
      <strong>{etiqueta}</strong>
      {detalle && <span>{detalle}</span>}
    </div>
  )
}

/* ───────── Radar ───────── */

interface EjeRadar {
  etiqueta: string
  valor: number | null // valor real, ya calculado por 90 minutos si procede
  referencia: number // valor que llena el eje al 100 %
  texto: string
  invertido?: boolean // true = cuanto menos, mejor
}

function Radar({ ejes }: { ejes: EjeRadar[] }) {
  const centro = 160
  const radio = 100
  const n = ejes.length

  const punto = (indice: number, proporcion: number) => {
    const angulo = (Math.PI * 2 * indice) / n - Math.PI / 2
    return {
      x: centro + Math.cos(angulo) * radio * proporcion,
      y: centro + Math.sin(angulo) * radio * proporcion,
    }
  }

  const proporciones = ejes.map((eje) => {
    if (eje.valor === null) return 0
    const base = eje.invertido
      ? 1 - eje.valor / eje.referencia
      : eje.valor / eje.referencia
    return limitar(base, 0.04, 1)
  })

  const poligono = proporciones
    .map((p, i) => {
      const { x, y } = punto(i, p)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      className="gj-radar"
      viewBox="-60 -10 440 340"
      role="img"
      aria-label="Gráfico de radar del perfil del jugador"
    >
      {[0.25, 0.5, 0.75, 1].map((nivel) => (
        <polygon
          key={nivel}
          className="gj-radar-malla"
          points={ejes
            .map((_, i) => {
              const { x, y } = punto(i, nivel)
              return `${x.toFixed(1)},${y.toFixed(1)}`
            })
            .join(' ')}
        />
      ))}

      {ejes.map((_, i) => {
        const { x, y } = punto(i, 1)
        return (
          <line
            key={i}
            className="gj-radar-eje"
            x1={centro}
            y1={centro}
            x2={x}
            y2={y}
          />
        )
      })}

      <polygon className="gj-radar-area" points={poligono} />

      {proporciones.map((p, i) => {
        const { x, y } = punto(i, p)
        return <circle key={i} className="gj-radar-punto" cx={x} cy={y} r="5" />
      })}

      {ejes.map((eje, i) => {
        const { x, y } = punto(i, 1.2)
        const ancla = x < centro - 8 ? 'end' : x > centro + 8 ? 'start' : 'middle'
        return (
          <g key={eje.etiqueta}>
            <text x={x} y={y - 2} textAnchor={ancla} className="gj-radar-etiqueta">
              {eje.etiqueta}
            </text>
            <text x={x} y={y + 12} textAnchor={ancla} className="gj-radar-valor">
              {eje.texto}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ───────── Barra comparada ───────── */

function Barra({
  etiqueta,
  valor,
  maximo,
  texto,
  suave = false,
}: {
  etiqueta: string
  valor: number
  maximo: number
  texto: string
  suave?: boolean
}) {
  const ancho = maximo > 0 ? limitar((valor / maximo) * 100) : 0

  return (
    <div className={`gj-barra${suave ? ' gj-barra-suave' : ''}`}>
      <div className="gj-barra-texto">
        <span>{etiqueta}</span>
        <strong>{texto}</strong>
      </div>
      <div className="gj-barra-pista">
        <i style={{ width: `${ancho}%` }} />
      </div>
    </div>
  )
}

function Panel({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children: ReactNode
}) {
  return (
    <article className="gj-panel">
      <header>
        <h3>{titulo}</h3>
        {descripcion && <p>{descripcion}</p>}
      </header>
      {children}
    </article>
  )
}

/* ───────── Componente principal ───────── */

function GraficosJugador({ estadisticas: s, portero }: GraficosJugadorProps) {
  const minutos = num(s, 'minutesPlayed')
  const partidos = num(s, 'appearances')
  const titular = num(s, 'matchesStarted')
  const valoracion = num(s, 'rating')

  // Valor por 90 minutos (solo si ha jugado lo suficiente para que sea fiable).
  const por90 = (clave: string): number | null => {
    const valor = num(s, clave)
    if (valor === null || minutos === null || minutos < 90) return null
    return (valor / minutos) * 90
  }

  const suma90 = (claves: string[]): number | null => {
    const partes = claves.map(por90)
    if (partes.every((p) => p === null)) return null
    return partes.reduce<number>((total, p) => total + (p ?? 0), 0)
  }

  const t90 = (valor: number | null, dec = 2) => fmt(valor, dec)

  /* Radar */
  let ejes: EjeRadar[]

  if (portero) {
    const aCero =
      num(s, 'cleanSheet') !== null && partidos
        ? ((num(s, 'cleanSheet') ?? 0) / partidos) * 100
        : null

    ejes = [
      { etiqueta: 'Paradas', valor: por90('saves'), referencia: 4, texto: t90(por90('saves'), 1) + '/90' },
      { etiqueta: '% paradas', valor: num(s, 'savesPercentage'), referencia: 80, texto: fmt(num(s, 'savesPercentage'), 0, '%') },
      { etiqueta: 'A cero', valor: aCero, referencia: 50, texto: fmt(aCero, 0, '%') },
      { etiqueta: 'Encaja poco', valor: por90('goalsConceded'), referencia: 2.5, invertido: true, texto: t90(por90('goalsConceded'), 1) + '/90' },
      { etiqueta: 'Pase', valor: num(s, 'accuratePassesPercentage'), referencia: 90, texto: fmt(num(s, 'accuratePassesPercentage'), 0, '%') },
      { etiqueta: 'Juego aéreo', valor: por90('highClaims'), referencia: 1.5, texto: t90(por90('highClaims'), 1) + '/90' },
    ]
  } else {
    const defensa = suma90(['tackles', 'interceptions'])

    ejes = [
      { etiqueta: 'Goles', valor: por90('goals'), referencia: 0.7, texto: t90(por90('goals')) + '/90' },
      { etiqueta: 'Asistencias', valor: por90('assists'), referencia: 0.4, texto: t90(por90('assists')) + '/90' },
      { etiqueta: 'Tiros', valor: por90('totalShots'), referencia: 3.5, texto: t90(por90('totalShots'), 1) + '/90' },
      { etiqueta: 'Pases clave', valor: por90('keyPasses'), referencia: 2.5, texto: t90(por90('keyPasses'), 1) + '/90' },
      { etiqueta: 'Regates', valor: por90('successfulDribbles'), referencia: 2.5, texto: t90(por90('successfulDribbles'), 1) + '/90' },
      { etiqueta: 'Defensa', valor: defensa, referencia: 4, texto: t90(defensa, 1) + '/90' },
    ]
  }

  const hayRadar = ejes.filter((e) => e.valor !== null).length >= 3

  /* Anillos */
  const anillos = (
    portero
      ? [
          { clave: 'savesPercentage', etiqueta: 'Paradas', detalle: 'tiros parados' },
          { clave: 'accuratePassesPercentage', etiqueta: 'Precisión de pase', detalle: 'pases acertados' },
          { clave: 'accurateLongBallsPercentage', etiqueta: 'Pase largo', detalle: 'balones largos' },
          { clave: 'penaltySavePercentage', etiqueta: 'Penaltis', detalle: 'penaltis parados' },
        ]
      : [
          { clave: 'accuratePassesPercentage', etiqueta: 'Precisión de pase', detalle: 'pases acertados' },
          { clave: 'successfulDribblesPercentage', etiqueta: 'Regates', detalle: 'regates con éxito' },
          { clave: 'totalDuelsWonPercentage', etiqueta: 'Duelos', detalle: 'duelos ganados' },
          { clave: 'goalConversionPercentage', etiqueta: 'Conversión', detalle: 'tiros que acaban en gol' },
        ]
  )
    .map((a) => ({ ...a, valor: num(s, a.clave) }))
    .filter((a): a is typeof a & { valor: number } => {
      if (a.valor === null) return false
      if (a.clave === 'penaltySavePercentage' && !(num(s, 'penaltyFaced') ?? 0)) return false
      if (a.clave === 'savesPercentage' && !(num(s, 'saves') ?? 0)) return false
      return true
    })

  /* Producción ofensiva */
  const goles = num(s, 'goals')
  const xg = num(s, 'expectedGoals')
  const asist = num(s, 'assists')
  const xa = num(s, 'expectedAssists')
  const difXg = goles !== null && xg !== null ? goles - xg : null

  const tirosPuerta = num(s, 'shotsOnTarget')
  const tirosFuera = num(s, 'shotsOffTarget')
  const tirosBloq = num(s, 'blockedShots')
  const tirosTotal =
    num(s, 'totalShots') ??
    ((tirosPuerta ?? 0) + (tirosFuera ?? 0) + (tirosBloq ?? 0) || null)

  const segmentosTiros = [
    { etiqueta: 'A puerta', valor: tirosPuerta, clase: 'a' },
    { etiqueta: 'Fuera', valor: tirosFuera, clase: 'b' },
    { etiqueta: 'Bloqueados', valor: tirosBloq, clase: 'c' },
  ].filter((t): t is typeof t & { valor: number } => t.valor !== null && t.valor > 0)

  /* Portería */
  const paradasDentro = num(s, 'savedShotsFromInsideTheBox')
  const paradasFuera = num(s, 'savedShotsFromOutsideTheBox')
  const paradasTotal = num(s, 'saves')
  const encajados = num(s, 'goalsConceded')
  const aCeroTotal = num(s, 'cleanSheet')

  /* Fichas físicas */
  const fichasFisicas = [
    { etiqueta: 'Kilómetros', valor: num(s, 'kilometersCovered'), icono: '🏃', sufijo: ' km', dec: 1 },
    { etiqueta: 'Velocidad máx.', valor: num(s, 'topSpeed'), icono: '⚡', sufijo: ' km/h', dec: 1 },
    { etiqueta: 'Esprints', valor: num(s, 'numberOfSprints'), icono: '💨', sufijo: '', dec: 0 },
  ].filter((f): f is typeof f & { valor: number } => f.valor !== null && f.valor > 0)

  /* Disciplina */
  const amarillas = num(s, 'yellowCards')
  const rojas = num(s, 'redCards')
  const faltas = num(s, 'fouls')
  const recibidas = num(s, 'wasFouled')
  const hayDisciplina = amarillas !== null || rojas !== null || faltas !== null

  const hayProduccion = !portero && (goles !== null || asist !== null)
  const hayTiros = !portero && tirosTotal !== null && tirosTotal > 0
  const hayPorteria =
    portero && (paradasTotal !== null || encajados !== null || aCeroTotal !== null)

  return (
    <div className="gj">
      {/* ───── Valoración + radar ───── */}
      {(valoracion !== null || hayRadar) && (
        <div className="gj-cabecera">
          {valoracion !== null && (
            <div className="gj-nota">
              <span>Valoración media</span>
              <Anillo
                porcentaje={valoracion * 10}
                texto={fmt(valoracion, 2)}
                etiqueta="sobre 10"
              />
              {partidos !== null && (
                <small>
                  {fmt(partidos, 0)} partidos
                  {minutos !== null && <> · {fmt(minutos, 0)} min</>}
                </small>
              )}
            </div>
          )}

          {hayRadar && (
            <div className="gj-radar-caja">
              <h3>Perfil del jugador</h3>
              <p>Rendimiento por 90 minutos frente a una referencia de élite</p>
              <Radar ejes={ejes} />
            </div>
          )}
        </div>
      )}

      {/* ───── Titularidad ───── */}
      {partidos !== null && titular !== null && partidos > 0 && partidos <= 50 && (
        <Panel
          titulo="Titularidad"
          descripcion={`${fmt(titular, 0)} partidos de titular y ${fmt(Math.max(0, partidos - titular), 0)} saliendo desde el banquillo`}
        >
          <div className="gj-puntos" aria-hidden="true">
            {Array.from({ length: partidos }, (_, i) => (
              <i key={i} className={i < titular ? 'activo' : ''} />
            ))}
          </div>
        </Panel>
      )}

      {/* ───── Anillos de precisión ───── */}
      {anillos.length > 0 && (
        <section className="gj-seccion">
          <h3 className="gj-titulo">🎯 Precisión</h3>
          <div className="gj-panel gj-anillos">
            {anillos.map((a) => (
              <Anillo
                key={a.clave}
                porcentaje={a.valor}
                texto={fmt(a.valor, 0, '%')}
                etiqueta={a.etiqueta}
                detalle={a.detalle}
              />
            ))}
          </div>
        </section>
      )}

      {/* ───── Producción ofensiva ───── */}
      {(hayProduccion || hayTiros) && (
        <section className="gj-seccion">
          <h3 className="gj-titulo">⚽ Producción ofensiva</h3>

          <div className="gj-rejilla">
            {hayProduccion && (
              <Panel
                titulo="Lo que marca y asiste, frente a lo esperado"
                descripcion="Compara sus cifras reales con las que sugieren sus ocasiones (xG y xA)"
              >
                <div className="gj-barras">
                  {goles !== null && (
                    <Barra
                      etiqueta="Goles"
                      valor={goles}
                      maximo={Math.max(goles, xg ?? 0, 1)}
                      texto={fmt(goles, 0)}
                    />
                  )}
                  {xg !== null && (
                    <Barra
                      etiqueta="Goles esperados (xG)"
                      valor={xg}
                      maximo={Math.max(goles ?? 0, xg, 1)}
                      texto={fmt(xg, 1)}
                      suave
                    />
                  )}
                  {asist !== null && (
                    <Barra
                      etiqueta="Asistencias"
                      valor={asist}
                      maximo={Math.max(asist, xa ?? 0, 1)}
                      texto={fmt(asist, 0)}
                    />
                  )}
                  {xa !== null && (
                    <Barra
                      etiqueta="Asistencias esperadas (xA)"
                      valor={xa}
                      maximo={Math.max(asist ?? 0, xa, 1)}
                      texto={fmt(xa, 1)}
                      suave
                    />
                  )}
                </div>

                {difXg !== null && (
                  <p className={`gj-veredicto ${difXg >= 0 ? 'gj-positivo' : 'gj-negativo'}`}>
                    {difXg >= 0
                      ? `Marca ${fmt(Math.abs(difXg), 1)} goles más de lo esperado: muy eficaz de cara a puerta.`
                      : `Marca ${fmt(Math.abs(difXg), 1)} goles menos de lo esperado: le falta acierto.`}
                  </p>
                )}
              </Panel>
            )}

            {hayTiros && tirosTotal !== null && (
              <Panel
                titulo="Dónde acaban sus tiros"
                descripcion={`${fmt(tirosTotal, 0)} tiros en total`}
              >
                {segmentosTiros.length > 0 ? (
                  <>
                    <div className="gj-apilada" role="img" aria-label="Reparto de tiros">
                      {segmentosTiros.map((t) => (
                        <span
                          key={t.etiqueta}
                          className={`gj-seg gj-seg-${t.clase}`}
                          style={{ flexGrow: t.valor }}
                        >
                          {fmt(t.valor, 0)}
                        </span>
                      ))}
                    </div>
                    <ul className="gj-leyenda">
                      {segmentosTiros.map((t) => (
                        <li key={t.etiqueta}>
                          <i className={`gj-seg-${t.clase}`} />
                          {t.etiqueta}
                          <b>{fmt((t.valor / tirosTotal) * 100, 0, '%')}</b>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="gj-veredicto">No hay desglose de tiros disponible.</p>
                )}
              </Panel>
            )}
          </div>
        </section>
      )}

      {/* ───── Portería ───── */}
      {hayPorteria && (
        <section className="gj-seccion">
          <h3 className="gj-titulo">🧤 Portería</h3>

          <div className="gj-fichas">
            {paradasTotal !== null && (
              <div className="gj-ficha">
                <span className="gj-ficha-icono" aria-hidden="true">🧤</span>
                <strong>{fmt(paradasTotal, 0)}</strong>
                <span>Paradas</span>
              </div>
            )}
            {encajados !== null && (
              <div className="gj-ficha">
                <span className="gj-ficha-icono" aria-hidden="true">🥅</span>
                <strong>{fmt(encajados, 0)}</strong>
                <span>Goles encajados</span>
              </div>
            )}
            {aCeroTotal !== null && (
              <div className="gj-ficha">
                <span className="gj-ficha-icono" aria-hidden="true">🛡️</span>
                <strong>{fmt(aCeroTotal, 0)}</strong>
                <span>Porterías a cero</span>
              </div>
            )}
          </div>

          {paradasDentro !== null && paradasFuera !== null && paradasDentro + paradasFuera > 0 && (
            <Panel titulo="Desde dónde para" descripcion="Paradas dentro y fuera del área">
              <div className="gj-barras">
                <Barra
                  etiqueta="Dentro del área"
                  valor={paradasDentro}
                  maximo={Math.max(paradasDentro, paradasFuera)}
                  texto={fmt(paradasDentro, 0)}
                />
                <Barra
                  etiqueta="Fuera del área"
                  valor={paradasFuera}
                  maximo={Math.max(paradasDentro, paradasFuera)}
                  texto={fmt(paradasFuera, 0)}
                  suave
                />
              </div>
            </Panel>
          )}
        </section>
      )}

      {/* ───── Físico ───── */}
      {fichasFisicas.length > 0 && (
        <section className="gj-seccion">
          <h3 className="gj-titulo">🏃 Físico</h3>
          <div className="gj-fichas">
            {fichasFisicas.map((f) => (
              <div className="gj-ficha" key={f.etiqueta}>
                <span className="gj-ficha-icono" aria-hidden="true">{f.icono}</span>
                <strong>{fmt(f.valor, f.dec, f.sufijo)}</strong>
                <span>{f.etiqueta}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───── Disciplina ───── */}
      {hayDisciplina && (
        <section className="gj-seccion">
          <h3 className="gj-titulo">🟨 Disciplina</h3>

          <div className="gj-disciplina">
            {amarillas !== null && (
              <div className="gj-cartulina-caja">
                <i className="gj-cartulina gj-amarilla" />
                <strong>{fmt(amarillas, 0)}</strong>
                <span>Amarillas</span>
              </div>
            )}

            {rojas !== null && (
              <div className="gj-cartulina-caja">
                <i className="gj-cartulina gj-roja" />
                <strong>{fmt(rojas, 0)}</strong>
                <span>Rojas</span>
              </div>
            )}

            {(faltas !== null || recibidas !== null) && (
              <div className="gj-panel gj-faltas">
                <div className="gj-barras">
                  {faltas !== null && (
                    <Barra
                      etiqueta="Faltas cometidas"
                      valor={faltas}
                      maximo={Math.max(faltas, recibidas ?? 0, 1)}
                      texto={fmt(faltas, 0)}
                      suave
                    />
                  )}
                  {recibidas !== null && (
                    <Barra
                      etiqueta="Faltas recibidas"
                      valor={recibidas}
                      maximo={Math.max(faltas ?? 0, recibidas, 1)}
                      texto={fmt(recibidas, 0)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default GraficosJugador