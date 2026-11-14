
import { useEffect, useState } from 'react'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  email_verificado: boolean
}

export default function MiCuenta() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarCuenta() {
      try {
        const respuesta = await fetch('/api/auth/usuario', {
          credentials: 'same-origin',
          cache: 'no-store',
        })

        if (respuesta.status === 401) {
          if (activo) {
            window.location.hash = '#/login'
          }
          return
        }

        if (!respuesta.ok) {
          throw new Error('No se ha podido cargar tu cuenta')
        }

        const datos: { usuario: Usuario } = await respuesta.json()

        if (activo) setUsuario(datos.usuario)
      } catch {
        if (activo) setError('No se ha podido cargar tu cuenta.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarCuenta()

    return () => {
      activo = false
    }
  }, [])

  return (
    <section className="seccion-contenido">
      <h1>Mi cuenta</h1>

      {cargando && <p>Cargando tu cuenta...</p>}

      {error && <p role="alert">{error}</p>}

      {usuario && (
        <>
          <h2>Información personal</h2>
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Correo:</strong> {usuario.email}</p>
          <p>
            <strong>Verificación del correo:</strong>{' '}
            {usuario.email_verificado
              ? 'Verificado'
              : 'Pendiente de verificación'}
          </p>

          <h2>Seguridad</h2>
          <p>
            Configura la verificación en dos pasos para proteger
            tu cuenta de EstadLiga.
          </p>

          <a className="boton-principal" href="#/mi-cuenta/seguridad">
            Configurar seguridad
          </a>
        </>
      )}
    </section>
  )
}
