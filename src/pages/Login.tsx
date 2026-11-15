
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import './Login.css'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
}

interface RespuestaAuth {
  mensaje?: string
  error?: string
  usuario?: Usuario
  requiere_2fa?: boolean
  desafio?: string
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [comprobandoSesion, setComprobandoSesion] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [desafio2FA, setDesafio2FA] = useState('')
  const [codigo2FA, setCodigo2FA] = useState('')
  const [usarRecuperacion, setUsarRecuperacion] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    async function recuperarSesion() {
      try {
        const respuesta = await fetch('/api/auth/usuario', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controlador.signal,
        })

        if (!respuesta.ok) return

        const datos: { usuario?: Usuario } = await respuesta.json()
        if (!controlador.signal.aborted && datos.usuario) {
          setUsuario(datos.usuario)
          window.dispatchEvent(new Event('estadliga:auth-cambio'))
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          console.error('No se ha podido recuperar la sesión:', err)
        }
      } finally {
        if (!controlador.signal.aborted) setComprobandoSesion(false)
      }
    }

    void recuperarSesion()
    return () => controlador.abort()
  }, [])

  function completarAcceso(datos: RespuestaAuth) {
    if (datos.requiere_2fa) {
      if (!datos.desafio) {
        throw new Error('El servidor no ha devuelto el desafío de verificación')
      }
      setDesafio2FA(datos.desafio)
      setCodigo2FA('')
      setUsarRecuperacion(false)
      setPassword('')
      setMensaje('Tu cuenta tiene activada la verificación en dos pasos.')
      return
    }

    if (!datos.usuario) {
      throw new Error('El servidor no ha devuelto el usuario')
    }

    setUsuario(datos.usuario)
    setPassword('')
    setMensaje('Has iniciado sesión correctamente.')
    window.dispatchEvent(new Event('estadliga:auth-cambio'))
  }

  async function leerRespuesta(
    respuesta: Response,
  ): Promise<RespuestaAuth> {
    const datos: RespuestaAuth = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(
        datos.error ?? 'No se ha podido completar la operación',
      )
    }

    return datos
  }

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault()

    if (cargando || comprobandoSesion) return

    setError('')
    setMensaje('')

    const emailLimpio = email.trim().toLowerCase()

    setCargando(true)

    try {
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: emailLimpio, password }),
      })

      completarAcceso(await leerRespuesta(respuesta))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ha ocurrido un error inesperado',
      )
    } finally {
      setCargando(false)
    }
  }

  async function iniciarConGoogle(credential: string) {
    if (cargando || comprobandoSesion) return

    setCargando(true)
    setError('')
    setMensaje('')

    try {
      const respuesta = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ credential }),
      })

      completarAcceso(await leerRespuesta(respuesta))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ha ocurrido un error inesperado',
      )
    } finally {
      setCargando(false)
    }
  }

  async function verificar2FA(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault()

    if (!desafio2FA || cargando) return

    setCargando(true)
    setError('')
    setMensaje('')

    try {
      const respuesta = await fetch('/api/auth/2fa/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          desafio: desafio2FA,
          ...(usarRecuperacion
            ? { codigo_recuperacion: codigo2FA.trim() }
            : { codigo: codigo2FA.trim() }),
        }),
      })

      const datos = await leerRespuesta(respuesta)

      if (!datos.usuario) {
        throw new Error('El servidor no ha devuelto el usuario')
      }

      setUsuario(datos.usuario)
      setDesafio2FA('')
      setCodigo2FA('')
      setUsarRecuperacion(false)
      setMensaje('Verificación completada correctamente.')

      window.dispatchEvent(new Event('estadliga:auth-cambio'))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ha ocurrido un error inesperado',
      )
    } finally {
      setCargando(false)
    }
  }

  async function cerrarSesion() {
    if (cargando) return

    setCargando(true)
    setError('')
    setMensaje('')

    try {
      const respuesta = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({}),
      })

      await leerRespuesta(respuesta)

      setUsuario(null)
      setDesafio2FA('')
      setCodigo2FA('')
      setUsarRecuperacion(false)
      setPassword('')
      setMensaje('Has cerrado sesión correctamente.')

      window.dispatchEvent(new Event('estadliga:auth-cambio'))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ha ocurrido un error al cerrar sesión',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="auth-pagina">
      <div className="auth-ambiente" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="auth-contenedor">
        <div className="auth-presentacion">
          <span className="auth-etiqueta">
            TU ESPACIO FUTBOLÍSTICO
          </span>

          <h1>
            {usuario
              ? 'Tu cuenta, tu fútbol.'
              : desafio2FA
                ? 'Protegemos tu cuenta.'
                : 'El fútbol se vive mejor aquí.'}
          </h1>

          <p>
            Sigue a tus equipos y jugadores favoritos y
            descubre sus estadísticas en un solo lugar.
          </p>

          <div className="auth-puntos" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="auth-tarjeta">
          <div className="auth-cabecera">
            <span className="auth-marca">
              ESTAD<span>LIGA</span>
            </span>

            <h2>
              {comprobandoSesion
                ? 'Comprobando sesión'
                : usuario
                  ? 'Mi sesión'
                  : desafio2FA
                    ? 'Verificación en dos pasos'
                    : 'Bienvenido de nuevo'}
            </h2>

            <p>
              {usuario
                ? 'Tu sesión está activa.'
                : desafio2FA
                  ? 'Confirma tu identidad para continuar.'
                  : 'Accede para continuar donde lo dejaste.'}
            </p>
          </div>

          {comprobandoSesion ? (
            <p className="auth-estado" role="status">
              Comprobando sesión...
            </p>
          ) : usuario ? (
            <div className="auth-perfil">
              <div className="auth-avatar" aria-hidden="true">
                {usuario.nombre.trim().charAt(0).toUpperCase()}
              </div>

              <strong>
                ¡Bienvenido, {usuario.nombre}!
              </strong>

              <p>{usuario.email}</p>

              <a
                className="auth-boton auth-boton-principal"
                href="#/inicio"
              >
                Ir al inicio
              </a>

              <button
                className="auth-boton auth-boton-secundario"
                type="button"
                onClick={() => void cerrarSesion()}
                disabled={cargando}
              >
                {cargando
                  ? 'Cerrando sesión...'
                  : 'Cerrar sesión'}
              </button>
            </div>
          ) : desafio2FA ? (
            <form
              className="auth-formulario"
              onSubmit={verificar2FA}
            >
              <div className="auth-campo">
                <label htmlFor="codigo-2fa">
                  {usarRecuperacion
                    ? 'Código de recuperación'
                    : 'Código de Google Authenticator'}
                </label>

                <input
                  id="codigo-2fa"
                  type="text"
                  inputMode={
                    usarRecuperacion ? 'text' : 'numeric'
                  }
                  autoComplete="one-time-code"
                  maxLength={usarRecuperacion ? 27 : 6}
                  value={codigo2FA}
                  onChange={(evento) =>
                    setCodigo2FA(evento.target.value)
                  }
                  placeholder={
                    usarRecuperacion
                      ? 'Código de recuperación'
                      : '000000'
                  }
                  required
                  disabled={cargando}
                />
              </div>

              <button
                className="auth-boton auth-boton-principal"
                type="submit"
                disabled={cargando}
              >
                {cargando
                  ? 'Verificando...'
                  : 'Verificar código'}
              </button>

              <button
                className="auth-enlace-boton"
                type="button"
                disabled={cargando}
                onClick={() => {
                  setUsarRecuperacion(!usarRecuperacion)
                  setCodigo2FA('')
                  setError('')
                }}
              >
                {usarRecuperacion
                  ? 'Usar Google Authenticator'
                  : 'Usar un código de recuperación'}
              </button>

              <button
                className="auth-enlace-boton"
                type="button"
                disabled={cargando}
                onClick={() => {
                  setDesafio2FA('')
                  setCodigo2FA('')
                  setError('')
                  setMensaje('')
                }}
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : (
            <>
              <p className="auth-ayuda">
                ¿Todavía no tienes cuenta? Puedes crearla con Google.
                El registro por correo estará disponible próximamente.
              </p>

              <form
                className="auth-formulario"
                onSubmit={enviarFormulario}
              >
                <div className="auth-campo">
                  <label htmlFor="auth-email">
                    Correo electrónico
                  </label>

                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(evento) =>
                      setEmail(evento.target.value)
                    }
                    disabled={cargando}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="auth-campo">
                  <label htmlFor="auth-password">
                    Contraseña
                  </label>

                  <input
                    id="auth-password"
                    type={
                      mostrarPassword ? 'text' : 'password'
                    }
                    autoComplete="current-password"
                    maxLength={128}
                    required
                    value={password}
                    onChange={(evento) =>
                      setPassword(evento.target.value)
                    }
                    disabled={cargando}
                    placeholder="Tu contraseña"
                  />
                </div>

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={mostrarPassword}
                    onChange={(evento) =>
                      setMostrarPassword(
                        evento.target.checked,
                      )
                    }
                    disabled={cargando}
                  />
                  Mostrar contraseña
                </label>

                <button
                  className="auth-boton auth-boton-principal"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando
                    ? 'Procesando...'
                    : 'Iniciar sesión'}
                </button>
              </form>

              <div className="auth-separador">
                <span>O accede o crea tu cuenta con</span>
              </div>

              <div className="auth-google">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={(respuesta) => {
                      if (!respuesta.credential) {
                        setError(
                          'Google no ha enviado una credencial.',
                        )
                        return
                      }

                      void iniciarConGoogle(
                        respuesta.credential,
                      )
                    }}
                    onError={() =>
                      setError(
                        'No se ha podido completar el acceso con Google.',
                      )
                    }
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                  />
                ) : (
                  <p>
                    Google no está configurado en este entorno.
                  </p>
                )}
              </div>
            </>
          )}

          {cargando && (
            <p className="auth-estado" role="status">
              Procesando solicitud...
            </p>
          )}

          {error && (
            <p className="auth-mensaje auth-error" role="alert">
              {error}
            </p>
          )}

          {mensaje && (
            <p
              className="auth-mensaje auth-exito"
              role="status"
            >
              {mensaje}
            </p>
          )}

          <a className="auth-volver" href="#/inicio">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </section>
  )
}
