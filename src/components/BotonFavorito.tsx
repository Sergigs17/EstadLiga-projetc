import { useEffect, useState, useSyncExternalStore } from 'react'
import './BotonFavorito.css'

type Clase = 'equipos' | 'jugadores'

interface EstadoFavoritos {
  cargado: boolean
  conSesion: boolean
  equipos: number[]
  jugadores: number[]
}

interface RespuestaFavoritos {
  equipos: { id: number }[]
  jugadores: { id: number }[]
}

// Estado compartido por todas las estrellas de la página: así no se
// pide la lista de favoritos una vez por cada botón.
let estado: EstadoFavoritos = {
  cargado: false,
  conSesion: false,
  equipos: [],
  jugadores: [],
}
const oyentes = new Set<() => void>()
let cargaEnCurso: Promise<void> | null = null

function cambiarEstado(nuevo: EstadoFavoritos) {
  estado = nuevo
  oyentes.forEach((oyente) => oyente())
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

function leerEstado() {
  return estado
}

function cargarFavoritos(): Promise<void> {
  if (cargaEnCurso) return cargaEnCurso
  cargaEnCurso = (async () => {
    try {
      const respuesta = await fetch('/api/favoritos', {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!respuesta.ok) {
        cambiarEstado({ cargado: true, conSesion: false, equipos: [], jugadores: [] })
        return
      }
      const datos = (await respuesta.json()) as RespuestaFavoritos
      cambiarEstado({
        cargado: true,
        conSesion: true,
        equipos: datos.equipos.map((equipo) => equipo.id),
        jugadores: datos.jugadores.map((jugador) => jugador.id),
      })
    } catch {
      cambiarEstado({ ...estado, cargado: true })
    } finally {
      cargaEnCurso = null
    }
  })()
  return cargaEnCurso
}

if (typeof window !== 'undefined') {
  // Al iniciar o cerrar sesión se vuelve a pedir la lista.
  window.addEventListener('estadliga:auth-cambio', () => {
    void cargarFavoritos()
  })
}

async function enviarCambio(clase: Clase, id: number, guardado: boolean) {
  const respuesta = await fetch(
    `/api/favoritos/${clase}${guardado ? `/${id}` : ''}`,
    {
      method: guardado ? 'DELETE' : 'POST',
      credentials: 'same-origin',
      headers: guardado ? undefined : { 'Content-Type': 'application/json' },
      body: guardado ? undefined : JSON.stringify({ id }),
    },
  )
  if (!respuesta.ok) throw new Error('No se ha podido guardar el cambio')
  await cargarFavoritos()
  window.dispatchEvent(new Event('estadliga:favoritos-cambio'))
}

interface BotonFavoritoProps {
  clase: Clase
  id: number
  nombre: string
  /** Muestra el texto junto a la estrella (para las fichas). */
  conTexto?: boolean
  className?: string
}

function IconoEstrella({ relleno }: { relleno: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 2.8l2.78 5.64 6.22.9-4.5 4.39 1.06 6.2L12 17.01 6.44 19.93l1.06-6.2L3 9.34l6.22-.9L12 2.8z"
        fill={relleno ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function BotonFavorito({
  clase,
  id,
  nombre,
  conTexto = false,
  className = '',
}: BotonFavoritoProps) {
  const favoritos = useSyncExternalStore(suscribir, leerEstado)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    void cargarFavoritos()
  }, [])

  const guardado = favoritos[clase].includes(id)
  const etiqueta = !favoritos.conSesion
    ? 'Inicia sesión para guardar en favoritos'
    : guardado
      ? `Quitar a ${nombre} de favoritos`
      : `Guardar a ${nombre} en favoritos`

  async function pulsar(evento: React.MouseEvent<HTMLButtonElement>) {
    // Las estrellas viven junto a enlaces: no deben navegar.
    evento.preventDefault()
    evento.stopPropagation()
    if (!favoritos.conSesion) {
      window.location.hash = '#/login'
      return
    }
    if (ocupado) return
    setOcupado(true)
    try {
      await enviarCambio(clase, id, guardado)
    } catch {
      // Si falla, la estrella se queda como estaba.
    } finally {
      setOcupado(false)
    }
  }

  return (
    <button
      type="button"
      className={`boton-favorito ${guardado ? 'es-favorito' : ''} ${
        conTexto ? 'con-texto' : ''
      } ${className}`}
      aria-pressed={favoritos.conSesion ? guardado : undefined}
      aria-label={etiqueta}
      title={etiqueta}
      disabled={ocupado}
      onClick={pulsar}
    >
      <IconoEstrella relleno={guardado} />
      {conTexto && (
        <span>{guardado ? 'En favoritos' : 'Guardar'}</span>
      )}
    </button>
  )
}
