import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Jugador } from '../../pages/EquipoDetalle'
import './PlantillaEquipo.css'

interface PlantillaEquipoProps {
  jugadores: Jugador[]
  cargando: boolean
  error: boolean
}

type Vista = 'campo' | 'tarjetas'

/* ───────── Posiciones ───────── */

interface InfoPosicion {
  indice: number
  clave: string
  titulo: string
  color: string
}

const POSICIONES: InfoPosicion[] = [
  { indice: 0, clave: 'POR', titulo: 'Porteros', color: '#e0a100' },
  { indice: 1, clave: 'DEF', titulo: 'Defensas', color: '#2b6fd6' },
  { indice: 2, clave: 'MED', titulo: 'Centrocampistas', color: '#12a05c' },
  { indice: 3, clave: 'DEL', titulo: 'Delanteros', color: '#d4202c' },
]

const OTROS: InfoPosicion = {
  indice: 4,
  clave: 'OTR',
  titulo: 'Otros jugadores',
  color: '#7b746f',
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

function infoPosicion(jugador: Jugador): InfoPosicion {
  return POSICIONES[obtenerGrupo(jugador.posicion)] ?? OTROS
}

/* ───────── Datos de un jugador ───────── */

const CODIGOS_PAIS: Record<string, string> = {
  spain: 'ESP', espana: 'ESP', france: 'FRA', francia: 'FRA', brazil: 'BRA',
  brasil: 'BRA', argentina: 'ARG', england: 'ENG', inglaterra: 'ENG',
  germany: 'GER', alemania: 'GER', portugal: 'POR', belgium: 'BEL',
  belgica: 'BEL', netherlands: 'NED', 'paises bajos': 'NED', italy: 'ITA',
  italia: 'ITA', uruguay: 'URU', colombia: 'COL', mexico: 'MEX',
  morocco: 'MAR', marruecos: 'MAR', croatia: 'CRO', croacia: 'CRO',
  denmark: 'DEN', dinamarca: 'DEN', poland: 'POL', polonia: 'POL',
  switzerland: 'SUI', suiza: 'SUI', senegal: 'SEN', nigeria: 'NGA',
  'united states': 'USA', usa: 'USA', 'estados unidos': 'USA', japan: 'JPN',
  japon: 'JPN', norway: 'NOR', noruega: 'NOR', sweden: 'SWE', suecia: 'SWE',
  chile: 'CHI', peru: 'PER', paraguay: 'PAR', ecuador: 'ECU',
  venezuela: 'VEN', cameroon: 'CMR', ghana: 'GHA', 'ivory coast': 'CIV',
  algeria: 'ALG', turkey: 'TUR', turquia: 'TUR', serbia: 'SRB',
  ukraine: 'UKR', austria: 'AUT', 'czech republic': 'CZE', slovenia: 'SVN',
  georgia: 'GEO', wales: 'WAL', scotland: 'SCO', ireland: 'IRL',
  'equatorial guinea': 'EQG', gabon: 'GAB', mali: 'MLI', guinea: 'GUI',
  'dr congo': 'COD', canada: 'CAN', australia: 'AUS', 'south korea': 'KOR',
  greece: 'GRE', hungary: 'HUN', romania: 'ROU', 'costa rica': 'CRC',
  'bosnia & herzegovina': 'BIH', finland: 'FIN', iceland: 'ISL',
}

function codigoPais(nacionalidad: string | null): string {
  if (!nacionalidad) return '—'

  const clave = nacionalidad
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return CODIGOS_PAIS[clave] ?? nacionalidad.slice(0, 3).toUpperCase()
}

function calcularEdad(fecha: string | null): number | null {
  if (!fecha) return null

  const nacimiento = new Date(fecha)
  if (Number.isNaN(nacimiento.getTime())) return null

  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const cumpleEsteAnio =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() >= nacimiento.getDate())

  if (!cumpleEsteAnio) edad -= 1

  return edad >= 14 && edad <= 55 ? edad : null
}

function nombreCompleto(jugador: Jugador): string {
  return `${jugador.nombre} ${jugador.apellido ?? ''}`.trim()
}

function nombreCorto(jugador: Jugador): string {
  return jugador.apellido?.trim() || jugador.nombre
}

function iniciales(jugador: Jugador): string {
  return `${jugador.nombre[0] ?? ''}${jugador.apellido?.[0] ?? ''}`.toUpperCase()
}

function ordenarPorDorsal(a: Jugador, b: Jugador): number {
  if (a.dorsal == null) return 1
  if (b.dorsal == null) return -1
  return a.dorsal - b.dorsal
}

/* ───────── Foto del jugador ───────── */

function Foto({ jugador }: { jugador: Jugador }) {
  const [fallida, setFallida] = useState(false)

  // La imagen se sirve desde nuestro Worker: primero busca en R2 y,
  // si no existe, la pide a Apify y la guarda para la próxima vez.
  const tieneId =
    jugador.api_id != null &&
    Number.isInteger(Number(jugador.api_id)) &&
    Number(jugador.api_id) > 0

  if (!tieneId || fallida) {
    return (
      <span className="pl-foto-vacia" aria-hidden="true">
        {iniciales(jugador)}
      </span>
    )
  }

  return (
    <img
      src={`/api/jugadores/${jugador.id}/imagen`}
      alt={`Foto de ${nombreCompleto(jugador)}`}
      loading="lazy"
      decoding="async"
      onError={() => setFallida(true)}
    />
  )
}

/* ───────── Piezas visuales ───────── */

function Ficha({ jugador }: { jugador: Jugador }) {
  const posicion = infoPosicion(jugador)

  return (
    <a
      className="pl-ficha"
      href={`#/jugadores/${jugador.id}`}
      style={{ '--pos': posicion.color } as CSSProperties}
      aria-label={`Ver estadísticas de ${nombreCompleto(jugador)}`}
      title={nombreCompleto(jugador)}
    >
      <span className="pl-ficha-foto">
        <Foto jugador={jugador} />
        <span className="pl-ficha-dorsal">{jugador.dorsal ?? '–'}</span>
      </span>
      <span className="pl-ficha-nombre">{nombreCorto(jugador)}</span>
    </a>
  )
}

function Carta({ jugador }: { jugador: Jugador }) {
  const posicion = infoPosicion(jugador)
  const edad = calcularEdad(jugador.fecha_nacimiento)
  const anio = jugador.fecha_nacimiento?.slice(0, 4)

  return (
    <a
      className="pl-carta"
      href={`#/jugadores/${jugador.id}`}
      style={{ '--pos': posicion.color } as CSSProperties}
      aria-label={`Ver estadísticas de ${nombreCompleto(jugador)}`}
    >
      <span className="pl-carta-dorsal">{jugador.dorsal ?? '–'}</span>
      <span className="pl-carta-pos">{posicion.clave}</span>

      <span className="pl-carta-foto">
        <Foto jugador={jugador} />
      </span>

      <span className="pl-carta-placa">
        <span className="pl-carta-nombre">{nombreCorto(jugador)}</span>
        {jugador.apellido && (
          <span className="pl-carta-pila">{jugador.nombre}</span>
        )}
      </span>

      <span className="pl-carta-datos">
        <span>
          <b>{edad ?? '—'}</b>
          <small>Edad</small>
        </span>
        <span>
          <b>{codigoPais(jugador.nacionalidad)}</b>
          <small>País</small>
        </span>
        <span>
          <b>{anio ?? '—'}</b>
          <small>Nació</small>
        </span>
      </span>
    </a>
  )
}

/* ───────── Gráficos de resumen ───────── */

const TRAMOS_EDAD = [
  { etiqueta: '<21', desde: 0, hasta: 20 },
  { etiqueta: '21-24', desde: 21, hasta: 24 },
  { etiqueta: '25-28', desde: 25, hasta: 28 },
  { etiqueta: '29-32', desde: 29, hasta: 32 },
  { etiqueta: '33+', desde: 33, hasta: 99 },
]

function Resumen({ jugadores }: { jugadores: Jugador[] }) {
  const datos = useMemo(() => {
    const porPosicion = [...POSICIONES, OTROS].map((posicion) => ({
      ...posicion,
      total: jugadores.filter(
        (jugador) => infoPosicion(jugador).indice === posicion.indice,
      ).length,
    }))

    const conEdad = jugadores
      .map((jugador) => ({ jugador, edad: calcularEdad(jugador.fecha_nacimiento) }))
      .filter((fila): fila is { jugador: Jugador; edad: number } => fila.edad !== null)

    const media = conEdad.length
      ? conEdad.reduce((suma, fila) => suma + fila.edad, 0) / conEdad.length
      : null
    const joven = conEdad.reduce<(typeof conEdad)[number] | null>(
      (menor, fila) => (!menor || fila.edad < menor.edad ? fila : menor),
      null,
    )
    const veterano = conEdad.reduce<(typeof conEdad)[number] | null>(
      (mayor, fila) => (!mayor || fila.edad > mayor.edad ? fila : mayor),
      null,
    )
    const tramos = TRAMOS_EDAD.map((tramo) => ({
      ...tramo,
      total: conEdad.filter(
        (fila) => fila.edad >= tramo.desde && fila.edad <= tramo.hasta,
      ).length,
    }))

    const paises = new Map<string, number>()
    jugadores.forEach((jugador) => {
      const codigo = codigoPais(jugador.nacionalidad)
      paises.set(codigo, (paises.get(codigo) ?? 0) + 1)
    })
    const rankingPaises = Array.from(paises.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )

    return { porPosicion, media, joven, veterano, tramos, rankingPaises }
  }, [jugadores])

  const maximoTramo = Math.max(1, ...datos.tramos.map((tramo) => tramo.total))
  const maximoPais = datos.rankingPaises[0]?.[1] ?? 1
  const extranjeros = datos.rankingPaises
    .filter(([codigo]) => codigo !== 'ESP')
    .reduce((suma, [, total]) => suma + total, 0)

  return (
    <div className="pl-resumen">
      <div className="pl-bloque pl-bloque-total">
        <strong>{jugadores.length}</strong>
        <span>jugadores en la plantilla</span>
        <small>{extranjeros} de otros países</small>
      </div>

      <div className="pl-bloque">
        <h4>Por posición</h4>
        <div className="pl-composicion" role="img" aria-label="Jugadores por posición">
          {datos.porPosicion
            .filter((posicion) => posicion.total > 0)
            .map((posicion) => (
              <span
                key={posicion.clave}
                style={{
                  flexGrow: posicion.total,
                  background: posicion.color,
                }}
                title={`${posicion.titulo}: ${posicion.total}`}
              >
                {posicion.total}
              </span>
            ))}
        </div>
        <ul className="pl-leyenda">
          {datos.porPosicion
            .filter((posicion) => posicion.total > 0)
            .map((posicion) => (
              <li key={posicion.clave}>
                <i style={{ background: posicion.color }} />
                {posicion.titulo}
              </li>
            ))}
        </ul>
      </div>

      <div className="pl-bloque">
        <h4>Edad</h4>
        <div className="pl-edad-cabecera">
          <strong>
            {datos.media !== null
              ? datos.media.toLocaleString('es-ES', { maximumFractionDigits: 1 })
              : '—'}
          </strong>
          <span>años de media</span>
        </div>
        <div className="pl-histograma" role="img" aria-label="Jugadores por tramo de edad">
          {datos.tramos.map((tramo) => (
            <div key={tramo.etiqueta}>
              <span className="pl-histograma-valor">{tramo.total}</span>
              <i style={{ height: `${Math.max(4, (tramo.total / maximoTramo) * 64)}px` }} />
              <small>{tramo.etiqueta}</small>
            </div>
          ))}
        </div>
        {datos.joven && datos.veterano && (
          <p className="pl-extremos">
            Más joven: <b>{nombreCorto(datos.joven.jugador)}</b> ({datos.joven.edad}) ·
            Más veterano: <b>{nombreCorto(datos.veterano.jugador)}</b> ({datos.veterano.edad})
          </p>
        )}
      </div>

      <div className="pl-bloque">
        <h4>Nacionalidades</h4>
        <ul className="pl-paises">
          {datos.rankingPaises.slice(0, 5).map(([codigo, total]) => (
            <li key={codigo}>
              <span>{codigo}</span>
              <i>
                <b style={{ width: `${(total / maximoPais) * 100}%` }} />
              </i>
              <em>{total}</em>
            </li>
          ))}
        </ul>
        {datos.rankingPaises.length > 5 && (
          <p className="pl-extremos">
            y {datos.rankingPaises.length - 5} nacionalidades más
          </p>
        )}
      </div>
    </div>
  )
}

/* ───────── Componente principal ───────── */

function PlantillaEquipo({ jugadores, cargando, error }: PlantillaEquipoProps) {
  const [vista, setVista] = useState<Vista>('campo')

  const grupos = POSICIONES.map((posicion) => ({
    ...posicion,
    jugadores: jugadores
      .filter((jugador) => obtenerGrupo(jugador.posicion) === posicion.indice)
      .sort(ordenarPorDorsal),
  }))

  const sinPosicionReconocida = jugadores
    .filter((jugador) => obtenerGrupo(jugador.posicion) === 4)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  // En el campo, el ataque va arriba y la portería abajo.
  const filasCampo = [...grupos].reverse()

  return (
    <section className="seccion-plantilla-equipo pl-plantilla">
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
        <>
          <Resumen jugadores={jugadores} />

          <div className="pl-vistas" role="group" aria-label="Forma de ver la plantilla">
            <button
              type="button"
              className={vista === 'campo' ? 'activo' : ''}
              aria-pressed={vista === 'campo'}
              onClick={() => setVista('campo')}
            >
              En el campo
            </button>
            <button
              type="button"
              className={vista === 'tarjetas' ? 'activo' : ''}
              aria-pressed={vista === 'tarjetas'}
              onClick={() => setVista('tarjetas')}
            >
              Tarjetas
            </button>
          </div>

          {vista === 'campo' && (
            <>
              <div className="pl-campo">
                <span className="pl-marca pl-marca-medio" aria-hidden="true" />
                <span className="pl-marca pl-marca-circulo" aria-hidden="true" />
                <span className="pl-marca pl-marca-area-sup" aria-hidden="true" />
                <span className="pl-marca pl-marca-area-inf" aria-hidden="true" />

                {filasCampo.map(
                  (grupo) =>
                    grupo.jugadores.length > 0 && (
                      <div className="pl-fila" key={grupo.clave}>
                        <span
                          className="pl-fila-etiqueta"
                          style={{ '--pos': grupo.color } as CSSProperties}
                        >
                          {grupo.titulo} · {grupo.jugadores.length}
                        </span>
                        <div className="pl-fila-jugadores">
                          {grupo.jugadores.map((jugador) => (
                            <Ficha jugador={jugador} key={jugador.id} />
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>

              {sinPosicionReconocida.length > 0 && (
                <div className="pl-banquillo">
                  <h3>Otros jugadores</h3>
                  <div className="pl-fila-jugadores">
                    {sinPosicionReconocida.map((jugador) => (
                      <Ficha jugador={jugador} key={jugador.id} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {vista === 'tarjetas' && (
            <div className="grupos-plantilla">
              {grupos.map(
                (grupo) =>
                  grupo.jugadores.length > 0 && (
                    <section className="pl-grupo" key={grupo.titulo}>
                      <div
                        className="pl-grupo-titulo"
                        style={{ '--pos': grupo.color } as CSSProperties}
                      >
                        <h3>{grupo.titulo}</h3>
                        <span>{grupo.jugadores.length}</span>
                      </div>

                      <div className="pl-cartas">
                        {grupo.jugadores.map((jugador) => (
                          <Carta jugador={jugador} key={jugador.id} />
                        ))}
                      </div>
                    </section>
                  ),
              )}

              {sinPosicionReconocida.length > 0 && (
                <section className="pl-grupo">
                  <div
                    className="pl-grupo-titulo"
                    style={{ '--pos': OTROS.color } as CSSProperties}
                  >
                    <h3>{OTROS.titulo}</h3>
                    <span>{sinPosicionReconocida.length}</span>
                  </div>

                  <div className="pl-cartas">
                    {sinPosicionReconocida.map((jugador) => (
                      <Carta jugador={jugador} key={jugador.id} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default PlantillaEquipo
