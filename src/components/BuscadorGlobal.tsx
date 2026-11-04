import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Equipo } from '../pages/Equipos'
import type { Jugador } from '../pages/EquipoDetalle'
import { estilosClub, obtenerSlugClub } from '../utils/clubes'
import './BuscadorGlobal.css'

/* ───────── Datos (se cargan una sola vez, al abrir el buscador) ───────── */

interface DatosBuscador {
  equipos: Equipo[]
  jugadores: Jugador[]
}

let cacheDatos: Promise<DatosBuscador> | null = null

function cargarDatos(): Promise<DatosBuscador> {
  if (!cacheDatos) {
    const leer = async <T,>(ruta: string): Promise<T> => {
      const respuesta = await fetch(ruta)
      if (!respuesta.ok) throw new Error(`No se ha podido cargar ${ruta}`)
      return (await respuesta.json()) as T
    }

    cacheDatos = Promise.all([
      leer<Equipo[]>('/api/equipos'),
      leer<Jugador[]>('/api/jugadores'),
    ])
      .then(([equipos, jugadores]) => ({ equipos, jugadores }))
      .catch((error: unknown) => {
        // Si falla, la próxima vez que se abra se vuelve a intentar.
        cacheDatos = null
        throw error
      })
  }

  return cacheDatos
}

/* ───────── Búsqueda ───────── */

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Apodos habituales, para encontrar al equipo con el nombre que usa la gente. */
const ALIAS_CLUB: Record<string, string> = {
  barcelona: 'barca blaugrana',
  atlmadrid: 'atleti colchonero',
  realmadrid: 'merengue',
  athletic: 'bilbao',
  rayovallecano: 'rayo',
  deportivocoruna: 'depor',
  realsociedad: 'txuri urdin',
}

interface Resultado {
  tipo: 'equipo' | 'jugador'
  id: number
  titulo: string
  subtitulo: string
  equipo: string
  href: string
  dorsal: number | null
  /** Más bajo = aparece antes. */
  puntos: number
}

function puntuar(consulta: string[], nombre: string, textoCompleto: string): number | null {
  if (!consulta.every((palabra) => textoCompleto.includes(palabra))) return null

  const palabrasNombre = nombre.split(' ')

  // 0 = el nombre empieza como lo escrito · 1 = alguna palabra empieza igual · 2 = contiene
  if (nombre.startsWith(consulta.join(' '))) return 0

  const todasAlInicio = consulta.every((palabra) =>
    palabrasNombre.some((p) => p.startsWith(palabra)),
  )

  return todasAlInicio ? 1 : 2
}

const MAX_EQUIPOS = 4
const MAX_JUGADORES = 6

function Escudo({ nombre }: { nombre: string }) {
  const [fallido, setFallido] = useState(false)
  const slug = obtenerSlugClub(nombre)

  if (!slug || fallido) return <span className="bs-escudo bs-escudo-vacio" aria-hidden="true" />

  return (
    <img
      className="bs-escudo"
      src={`/escudos/${slug}.png`}
      alt=""
      loading="lazy"
      onError={() => setFallido(true)}
    />
  )
}

/* ───────── Componente ───────── */

function BuscadorGlobal() {
  const [abierto, setAbierto] = useState(false)
  const [consulta, setConsulta] = useState('')
  const [activo, setActivo] = useState(0)
  const [datos, setDatos] = useState<DatosBuscador | null>(null)
  const [error, setError] = useState(false)

  const id = useId()
  const contenedor = useRef<HTMLDivElement>(null)
  const entrada = useRef<HTMLInputElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  const cerrar = useCallback((devolverFoco = false) => {
    setAbierto(false)
    setConsulta('')
    setActivo(0)
    if (devolverFoco) boton.current?.focus()
  }, [])

  // Al abrir: cargar datos y poner el cursor en el campo.
  useEffect(() => {
    if (!abierto) return

    let cancelado = false
    setError(false)

    cargarDatos()
      .then((resultado) => {
        if (!cancelado) setDatos(resultado)
      })
      .catch(() => {
        if (!cancelado) setError(true)
      })

    entrada.current?.focus()

    return () => {
      cancelado = true
    }
  }, [abierto])

  // Cerrar al hacer clic fuera o al cambiar de página.
  useEffect(() => {
    if (!abierto) return

    const clicFuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) cerrar()
    }
    const cambioDePagina = () => cerrar()

    document.addEventListener('pointerdown', clicFuera)
    window.addEventListener('hashchange', cambioDePagina)

    return () => {
      document.removeEventListener('pointerdown', clicFuera)
      window.removeEventListener('hashchange', cambioDePagina)
    }
  }, [abierto, cerrar])

  // Atajo: la tecla "/" abre el buscador desde cualquier página.
  useEffect(() => {
    const atajo = (evento: KeyboardEvent) => {
      if (evento.key !== '/' || evento.ctrlKey || evento.metaKey || evento.altKey) return

      const destino = evento.target as HTMLElement | null
      const escribiendo =
        destino &&
        (destino.tagName === 'INPUT' ||
          destino.tagName === 'TEXTAREA' ||
          destino.tagName === 'SELECT' ||
          destino.isContentEditable)

      if (escribiendo) return

      evento.preventDefault()
      setAbierto(true)
    }

    window.addEventListener('keydown', atajo)
    return () => window.removeEventListener('keydown', atajo)
  }, [])

  // Índice de búsqueda: se prepara una vez cuando llegan los datos.
  const indice = useMemo(() => {
    if (!datos) return null

    return {
      equipos: datos.equipos.map((equipo) => {
        const slug = obtenerSlugClub(equipo.nombre)
        const nombre = normalizar(equipo.nombre)
        return {
          equipo,
          nombre,
          texto: normalizar(`${equipo.nombre} ${equipo.ciudad ?? ''} ${ALIAS_CLUB[slug ?? ''] ?? ''}`),
        }
      }),
      jugadores: datos.jugadores.map((jugador) => {
        const nombre = normalizar(`${jugador.nombre} ${jugador.apellido ?? ''}`)
        return {
          jugador,
          nombre,
          texto: normalizar(`${jugador.nombre} ${jugador.apellido ?? ''} ${jugador.equipo}`),
        }
      }),
    }
  }, [datos])

  const resultados = useMemo<Resultado[]>(() => {
    const palabras = normalizar(consulta).split(' ').filter(Boolean)

    if (!indice || palabras.length === 0 || normalizar(consulta).length < 2) return []

    const equipos: Resultado[] = indice.equipos
      .flatMap(({ equipo, nombre, texto }) => {
        const puntos = puntuar(palabras, nombre, texto)
        return puntos === null
          ? []
          : [
              {
                tipo: 'equipo' as const,
                id: equipo.id,
                titulo: equipo.nombre,
                subtitulo: [equipo.estadio, equipo.ciudad].filter(Boolean).join(' · ') || 'Equipo',
                equipo: equipo.nombre,
                href: `#/equipos/${equipo.id}`,
                dorsal: null,
                puntos,
              },
            ]
      })
      .sort((a, b) => a.puntos - b.puntos || a.titulo.localeCompare(b.titulo, 'es'))
      .slice(0, MAX_EQUIPOS)

    const jugadores: Resultado[] = indice.jugadores
      .flatMap(({ jugador, nombre, texto }) => {
        const puntos = puntuar(palabras, nombre, texto)
        return puntos === null
          ? []
          : [
              {
                tipo: 'jugador' as const,
                id: jugador.id,
                titulo: `${jugador.nombre} ${jugador.apellido ?? ''}`.trim(),
                subtitulo: [jugador.posicion, jugador.equipo].filter(Boolean).join(' · '),
                equipo: jugador.equipo,
                href: `#/jugadores/${jugador.id}`,
                dorsal: jugador.dorsal,
                puntos,
              },
            ]
      })
      .sort((a, b) => a.puntos - b.puntos || a.titulo.localeCompare(b.titulo, 'es'))
      .slice(0, MAX_JUGADORES)

    return [...equipos, ...jugadores]
  }, [consulta, indice])

  const hayConsulta = normalizar(consulta).length >= 2
  const equiposVisibles = resultados.filter((r) => r.tipo === 'equipo')
  const jugadoresVisibles = resultados.filter((r) => r.tipo === 'jugador')

  const ir = (resultado: Resultado) => {
    window.location.hash = resultado.href
    cerrar()
  }

  const teclado = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape') {
      evento.preventDefault()
      cerrar(true)
      return
    }

    if (resultados.length === 0) return

    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setActivo((valor) => (valor + 1) % resultados.length)
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setActivo((valor) => (valor - 1 + resultados.length) % resultados.length)
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      ir(resultados[activo] ?? resultados[0])
    }
  }

  const fila = (resultado: Resultado, posicion: number) => (
    <li
      key={`${resultado.tipo}-${resultado.id}`}
      id={`${id}-op-${posicion}`}
      role="option"
      aria-selected={posicion === activo}
      style={estilosClub(resultado.equipo)}
    >
      <a
        href={resultado.href}
        tabIndex={-1}
        className={posicion === activo ? 'activa' : ''}
        onClick={() => cerrar()}
        onMouseEnter={() => setActivo(posicion)}
      >
        {resultado.tipo === 'equipo' ? (
          <Escudo nombre={resultado.equipo} />
        ) : (
          <span className="bs-avatar" aria-hidden="true">
            {resultado.titulo
              .split(' ')
              .map((p) => p.charAt(0))
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
        )}

        <span className="bs-texto">
          <b>{resultado.titulo}</b>
          <small>{resultado.subtitulo}</small>
        </span>

        {resultado.dorsal !== null && <span className="bs-dorsal">#{resultado.dorsal}</span>}
        {resultado.tipo === 'jugador' && <Escudo nombre={resultado.equipo} />}
      </a>
    </li>
  )

  return (
    <div className="buscador" ref={contenedor}>
      <button
        ref={boton}
        type="button"
        className={`buscador-boton${abierto ? ' abierto' : ''}`}
        aria-label="Buscar equipos y jugadores"
        aria-expanded={abierto}
        aria-controls={`${id}-panel`}
        title="Buscar (atajo: /)"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.4" />
          <path d="m20 20-3.6-3.6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>

      {abierto && (
        <div className="buscador-panel" id={`${id}-panel`} role="search">
          <div className="buscador-campo">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
              <path d="m20 20-3.6-3.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>

            <input
              ref={entrada}
              type="text"
              role="combobox"
              aria-expanded={resultados.length > 0}
              aria-controls={`${id}-lista`}
              aria-activedescendant={resultados.length > 0 ? `${id}-op-${activo}` : undefined}
              aria-autocomplete="list"
              aria-label="Buscar equipos y jugadores"
              autoComplete="off"
              spellCheck={false}
              placeholder="Busca un equipo o un jugador…"
              value={consulta}
              onChange={(evento) => {
                setConsulta(evento.target.value)
                setActivo(0)
              }}
              onKeyDown={teclado}
            />

            {consulta && (
              <button
                type="button"
                className="buscador-borrar"
                aria-label="Borrar búsqueda"
                onClick={() => {
                  setConsulta('')
                  entrada.current?.focus()
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="buscador-cuerpo" aria-live="polite">
            {error ? (
              <p className="bs-mensaje bs-error">
                No se ha podido cargar el buscador. Comprueba la conexión e inténtalo de nuevo.
              </p>
            ) : !datos ? (
              <p className="bs-mensaje">Cargando…</p>
            ) : !hayConsulta ? (
              <p className="bs-mensaje">
                Escribe al menos 2 letras. Prueba con «Madrid», «Courtois» o «Barça».
              </p>
            ) : resultados.length === 0 ? (
              <p className="bs-mensaje">
                No hay resultados para <b>«{consulta.trim()}»</b>.
              </p>
            ) : (
              <ul className="bs-lista" id={`${id}-lista`} role="listbox" aria-label="Resultados">
                {equiposVisibles.length > 0 && (
                  <>
                    <li className="bs-grupo" role="presentation">Equipos</li>
                    {equiposVisibles.map((r) => fila(r, resultados.indexOf(r)))}
                  </>
                )}

                {jugadoresVisibles.length > 0 && (
                  <>
                    <li className="bs-grupo" role="presentation">Jugadores</li>
                    {jugadoresVisibles.map((r) => fila(r, resultados.indexOf(r)))}
                  </>
                )}
              </ul>
            )}
          </div>

          <p className="buscador-ayuda" aria-hidden="true">
            <kbd>↑</kbd> <kbd>↓</kbd> moverte · <kbd>Intro</kbd> abrir · <kbd>Esc</kbd> cerrar
          </p>
        </div>
      )}
    </div>
  )
}

export default BuscadorGlobal