
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './Seguridad.css'

type Paso = 'inicio' | 'qr' | 'recuperacion'

interface Estado2FA {
  activado: boolean
}

interface Preparacion2FA {
  secreto: string
  enlace: string
  mensaje?: string
}

interface Activacion2FA {
  activado: boolean
  mensaje?: string
  codigos_recuperacion: string[]
}

interface RespuestaError {
  error?: string
}

async function solicitar<T>(
  ruta: string,
  opciones?: RequestInit,
): Promise<T> {
  const respuesta = await fetch(ruta, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...opciones,
  })

  const datos: unknown = await respuesta.json()

  if (!respuesta.ok) {
    const error = datos as RespuestaError
    throw new Error(
      error.error || 'No se ha podido completar la operación',
    )
  }

  return datos as T
}

export default function Seguridad() {
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [activado, setActivado] = useState(false)
  const [paso, setPaso] = useState<Paso>('inicio')

  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  const [preparacion, setPreparacion] =
    useState<Preparacion2FA | null>(null)

  const [codigosRecuperacion, setCodigosRecuperacion] =
    useState<string[]>([])

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let activo = true

    async function comprobarEstado() {
      try {
        const estado = await solicitar<Estado2FA>(
          '/api/auth/2fa/estado',
        )

        if (activo) setActivado(estado.activado)
      } catch (err) {
        if (!activo) return

        if (
          err instanceof Error &&
          /iniciar sesión/i.test(err.message)
        ) {
          window.location.hash = '#/login'
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : 'No se ha podido comprobar la seguridad',
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    void comprobarEstado()

    return () => {
      activo = false
    }
  }, [])

  async function preparar() {
    if (!password) {
      setError('Introduce tu contraseña')
      return
    }

    setProcesando(true)
    setError('')
    setMensaje('')

    try {
      const datos = await solicitar<Preparacion2FA>(
        '/api/auth/2fa/preparar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        },
      )

      setPreparacion(datos)
      setPassword('')
      setCodigo('')
      setPaso('qr')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se ha podido preparar Google Authenticator',
      )
    } finally {
      setProcesando(false)
    }
  }

  async function activar() {
    if (!/^\d{6}$/.test(codigo)) {
      setError('Introduce un código de seis dígitos')
      return
    }

    setProcesando(true)
    setError('')

    try {
      const datos = await solicitar<Activacion2FA>(
        '/api/auth/2fa/activar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codigo }),
        },
      )

      setActivado(datos.activado)
      setPreparacion(null)
      setCodigo('')
      setCodigosRecuperacion(datos.codigos_recuperacion)
      setPaso('recuperacion')
      setMensaje(
        datos.mensaje || 'Google Authenticator activado correctamente',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se ha podido activar Google Authenticator',
      )
    } finally {
      setProcesando(false)
    }
  }

  function terminar() {
    setCodigosRecuperacion([])
    setPreparacion(null)
    setPaso('inicio')
    setMensaje('')
    setError('')
  }

  return (
    <section className="seccion-contenido seguridad-pagina">
      <a href="#/mi-cuenta">← Volver a Mi cuenta</a>

      <h1>Seguridad de la cuenta</h1>

      <div className="seguridad-tarjeta">
        <div className="seguridad-encabezado">
          <div>
            <h2>Google Authenticator</h2>
            <p>Verificación en dos pasos</p>
          </div>

          {!cargando && !error && (
            <span className={
              activado
                ? 'seguridad-estado activo'
                : 'seguridad-estado inactivo'
            }>
              {activado ? 'Activado' : 'Desactivado'}
            </span>
          )}
        </div>

        {cargando && <p>Comprobando seguridad...</p>}

        {error && (
          <p className="seguridad-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="seguridad-exito" role="status">
            {mensaje}
          </p>
        )}

        {!cargando && paso === 'inicio' && (
          <>
            {activado ? (
              <p>
                Tu cuenta está protegida mediante
                Google Authenticator.
              </p>
            ) : (
              <>
                <p>
                  Añade una capa adicional de seguridad a tu cuenta.
                  Al iniciar sesión necesitarás tu contraseña y
                  un código de Google Authenticator.
                </p>

                <label
                  className="seguridad-etiqueta"
                  htmlFor="seguridad-password"
                >
                  Confirma tu contraseña
                </label>

                <input
                  id="seguridad-password"
                  className="seguridad-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={procesando}
                />

                <button
                  className="seguridad-boton"
                  type="button"
                  disabled={procesando}
                  onClick={() => void preparar()}
                >
                  {procesando
                    ? 'Preparando...'
                    : 'Activar Google Authenticator'}
                </button>
              </>
            )}
          </>
        )}

        {paso === 'qr' && preparacion && (
          <div className="seguridad-configuracion">
            <h3>1. Escanea el código QR</h3>

            <p>
              Abre Google Authenticator y añade una cuenta
              escaneando este código.
            </p>

            <div className="seguridad-qr">
              <QRCodeSVG
                value={preparacion.enlace}
                size={210}
                level="M"
              />
            </div>

            <details>
              <summary>No puedo escanear el QR</summary>
              <p>
                Introduce esta clave manualmente en tu
                aplicación de autenticación:
              </p>
              <code className="seguridad-secreto">
                {preparacion.secreto}
              </code>
            </details>

            <h3>2. Confirma el código</h3>

            <p>
              Introduce el código de seis dígitos que
              aparece en Google Authenticator.
            </p>

            <input
              className="seguridad-input seguridad-codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              aria-label="Código de Google Authenticator"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value.replace(/\D/g, ''))
              }
              disabled={procesando}
            />

            <button
              className="seguridad-boton"
              type="button"
              disabled={procesando}
              onClick={() => void activar()}
            >
              {procesando
                ? 'Verificando...'
                : 'Confirmar y activar'}
            </button>

            <button
              className="seguridad-boton-secundario"
              type="button"
              disabled={procesando}
              onClick={() => {
                setPreparacion(null)
                setCodigo('')
                setError('')
                setPaso('inicio')
              }}
            >
              Volver
            </button>
          </div>
        )}

        {paso === 'recuperacion' && (
          <div className="seguridad-recuperacion">
            <h3>Guarda tus códigos de recuperación</h3>

            <p>
              Estos códigos te permitirán acceder a tu cuenta
              si pierdes el acceso a Google Authenticator.
              Cada código se puede utilizar una sola vez.
            </p>

            <p>
              <strong>
                No volverán a mostrarse. Guárdalos en un
                lugar privado y seguro.
              </strong>
            </p>

            <div className="seguridad-codigos">
              {codigosRecuperacion.map((valor) => (
                <code key={valor}>{valor}</code>
              ))}
            </div>

            <button
              className="seguridad-boton"
              type="button"
              onClick={terminar}
            >
              He guardado mis códigos
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
