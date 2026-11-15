import { iniciarSesionGoogle } from './login-google'

import {

  preparar2FA,

  activar2FA,

  estado2FA,

} from './activacion-2fa'

import { verificarSegundoFactor } from './verificacion-2fa'

import { crearDesafio2FA } from './desafios'

import { consumirIntento } from './rate-limit'

import { regenerarCodigosRecuperacion } from './regeneracion-2fa'

import { desactivar2FA } from './desactivacion-2fa'

import {

  crearHashPassword,

  verificarPassword,

} from './passwords'

import {

  crearSesion,

  cookieIniciarSesion,

  cookieCerrarSesion,

  obtenerUsuarioSesion,

  revocarSesion,

} from './sesiones'

import {

  enviarVerificacionEmail,

  verificarEmail,

  reenviarVerificacion,

} from './verificacion-email'

interface AuthEnv {

  estadliga_db: D1Database

  TOTP_ENCRYPTION_KEY: string

  GOOGLE_CLIENT_ID: string

  RESEND_API_KEY: string

  RESEND_FROM_EMAIL: string

}

interface UsuarioBD {

  id: number

  nombre: string

  email: string

  password_hash: string

  rol: 'usuario' | 'admin'

  email_verificado: number

}

interface DatosAuth {

  nombre?: unknown

  email?: unknown

  password?: unknown

}

function json(

  datos: unknown,

  status = 200,

  headers?: HeadersInit,

): Response {

  const cabeceras = new Headers(headers)

  cabeceras.set('Cache-Control', 'no-store')

  cabeceras.set('Content-Type', 'application/json; charset=utf-8')

  cabeceras.set('X-Content-Type-Options', 'nosniff')

  return new Response(JSON.stringify(datos), {

    status,

    headers: cabeceras,

  })

}

function comprobarOrigen(request: Request): boolean {

  const origen = request.headers.get('Origin')

  if (!origen) return false

  const url = new URL(request.url)

  if (origen === url.origin) return true

  return (

    url.hostname === 'localhost' &&

    url.port === '8788' &&

    origen === 'http\://localhost:5173'

  )

}

async function leerDatos(

  request: Request,

): Promise<DatosAuth | null> {

  const tipo = request.headers.get('Content-Type') ?? ''

  if (!tipo.toLowerCase().startsWith('application/json')) {

    return null

  }

  const longitud = Number(

    request.headers.get('Content-Length') ?? 0,

  )

  if (longitud > 8192) return null

  try {

    const datos: unknown = await request.json()

    if (

      !datos ||

      typeof datos !== 'object' ||

      Array.isArray(datos)

    ) {

      return null

    }

    return datos as DatosAuth

  } catch {

    return null

  }

}

function validarEmail(email: string): boolean {

  return (

    email.length <= 254 &&

    /^[^\s@]+@[^\s@]+**\.**[^\s@]+$/.test(email)

  )

}

function validarPassword(password: string): boolean {

  return (

    password.length >= 12 &&

    password.length <= 128 &&

    new TextEncoder().encode(password).length <= 512

  )

}

async function tiene2FA(

  env: AuthEnv,

  usuarioId: number,

): Promise<boolean> {

  const configuracion = await env.estadliga_db

    .prepare(`

      SELECT activado

      FROM usuarios_2fa

      WHERE usuario_id = ?

    `)

    .bind(usuarioId)

    .first<{ activado: number }>()

  return configuracion?.activado === 1

}

async function registrar(

  request: Request,

  env: AuthEnv,

): Promise<Response> {

  const datos = await leerDatos(request)

  if (!datos) {

    return json({ error: 'Solicitud no válida' }, 400)

  }

  const nombre =

    typeof datos.nombre === 'string'

      ? datos.nombre.trim()

      : ''

  const email =

    typeof datos.email === 'string'

      ? datos.email.trim().toLowerCase()

      : ''

  const password =

    typeof datos.password === 'string'

      ? datos.password

      : ''

  if (nombre.length < 3 || nombre.length > 50) {

    return json({

      error: 'El nombre debe tener entre 3 y 50 caracteres',

    }, 400)

  }

  if (!validarEmail(email)) {

    return json({

      error: 'Introduce un correo electrónico válido',

    }, 400)

  }

  if (!validarPassword(password)) {

    return json({

      error: 'La contraseña debe tener entre 12 y 128 caracteres',

    }, 400)

  }

  const limiteIP = await consumirIntento(

    request,

    env,

    'registro',

  )

  const limiteCuenta = await consumirIntento(

    request,

    env,

    'registro',

    email,

  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {

    return json({

      error: 'Demasiados intentos de registro. Inténtalo más tarde.',

    }, 429, {

      'Retry-After': String(Math.max(

        1,

        limiteIP.reintentarEn,

        limiteCuenta.reintentarEn,

      )),

    })

  }

  const existente = await env.estadliga_db

    .prepare('SELECT id FROM usuarios WHERE email = ?')

    .bind(email)

    .first()

  if (existente) {

    return json({

      error: 'No se ha podido registrar esta cuenta',

    }, 409)

  }

  const passwordHash = await crearHashPassword(password)

  let usuarioId: number

  try {

    const resultado = await env.estadliga_db

      .prepare(`

        INSERT INTO usuarios (

          nombre,

          email,

          password_hash,

          rol,

          email_verificado

        )

        VALUES (?, ?, ?, 'usuario', 0)

      `)

      .bind(nombre, email, passwordHash)

      .run()

    if (!resultado.success || !resultado.meta.last_row_id) {

      return json({

        error: 'No se ha podido crear la cuenta',

      }, 500)

    }

    usuarioId = resultado.meta.last_row_id

  } catch {

    return json({

      error: 'No se ha podido registrar esta cuenta',

    }, 409)

  }

  const enviado = await enviarVerificacionEmail(

    request,

    env,

    usuarioId,

    nombre,

    email,

  )

  return json({

    mensaje: enviado

      ? 'Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.'

      : 'Cuenta creada, pero no se ha podido enviar el correo. Solicita otro enlace de verificación.',

    requiere_verificacion: true,

    email_enviado: enviado,

  }, 201)

}

async function iniciarSesion(

  request: Request,

  env: AuthEnv,

): Promise<Response> {

  const datos = await leerDatos(request)

  if (!datos) {

    return json({ error: 'Solicitud no válida' }, 400)

  }

  const email =

    typeof datos.email === 'string'

      ? datos.email.trim().toLowerCase()

      : ''

  const password =

    typeof datos.password === 'string'

      ? datos.password

      : ''

  if (

    !validarEmail(email) ||

    !password ||

    password.length > 128

  ) {

    return json({ error: 'Credenciales incorrectas' }, 401)

  }

  const limiteIP = await consumirIntento(

    request,

    env,

    'login',

  )

  const limiteCuenta = await consumirIntento(

    request,

    env,

    'login',

    email,

  )

  if (!limiteIP.permitido || !limiteCuenta.permitido) {

    return json({

      error: 'Demasiados intentos de acceso. Inténtalo más tarde.',

    }, 429, {

      'Retry-After': String(Math.max(

        1,

        limiteIP.reintentarEn,

        limiteCuenta.reintentarEn,

      )),

    })

  }

  const usuario = await env.estadliga_db

    .prepare(`

      SELECT

        id,

        nombre,

        email,

        password_hash,

        rol,

        email_verificado

      FROM usuarios

      WHERE email = ?

      LIMIT 1

    `)

    .bind(email)

    .first<UsuarioBD>()

  if (

    !usuario ||

    !(await verificarPassword(password, usuario.password_hash))

  ) {

    return json({ error: 'Credenciales incorrectas' }, 401)

  }

  if (usuario.email_verificado !== 1) {

    return json({

      error:

        'Debes verificar tu correo electrónico antes de iniciar sesión.',

      requiere_verificacion: true,

    }, 403)

  }

  if (await tiene2FA(env, usuario.id)) {

    const desafio = await crearDesafio2FA(env, usuario.id)

    return json({

      requiere_2fa: true,

      desafio,

      expira_en_segundos: 300,

      mensaje: 'Introduce el código de Google Authenticator',

    })

  }

  const token = await crearSesionSin2FA(env, usuario.id)

if (!token) {

  const desafio = await crearDesafio2FA(env, usuario.id)

  return json({

    requiere_2fa: true,

    desafio,

    expira_en_segundos: 300,

    mensaje: 'Introduce el código de Google Authenticator',

  })

}

  return json({

    mensaje: 'Sesión iniciada correctamente',

    usuario: {

      id: usuario.id,

      nombre: usuario.nombre,

      email: usuario.email,

      rol: usuario.rol,

    },

  }, 200, {

    'Set-Cookie': cookieIniciarSesion(request, token),

  })

}

async function consultarUsuario(

  request: Request,

  env: AuthEnv,

): Promise<Response> {

  const usuario = await obtenerUsuarioSesion(request, env)

  if (!usuario) {

    return json({ error: 'No has iniciado sesión' }, 401)

  }

  return json({ usuario })

}

async function cerrarSesion(

  request: Request,

  env: AuthEnv,

): Promise<Response> {

  await revocarSesion(request, env)

  return json({

    mensaje: 'Sesión cerrada correctamente',

  }, 200, {

    'Set-Cookie': cookieCerrarSesion(request),

  })

}

export async function manejarAuth(

  request: Request,

  env: AuthEnv,

): Promise<Response | null> {

  const url = new URL(request.url)

  if (!url.pathname.startsWith('/api/auth/')) {

    return null

  }

  const rutas = [

    '/api/auth/registro',

    '/api/auth/login',

    '/api/auth/google',

    '/api/auth/logout',

    '/api/auth/usuario',

    '/api/auth/verificar-email',

    '/api/auth/reenviar-verificacion',

    '/api/auth/2fa/verificar',

    '/api/auth/2fa/preparar',

    '/api/auth/2fa/activar',

    '/api/auth/2fa/estado',

    '/api/auth/2fa/regenerar-recuperacion',

  '/api/auth/2fa/desactivar',

  ]

  if (!rutas.includes(url.pathname)) {

    return json({ error: 'Ruta no encontrada' }, 404)

  }

  const rutasGET = [

    '/api/auth/usuario',

    '/api/auth/2fa/estado',

    '/api/auth/verificar-email',

  ]

  const metodoEsperado = rutasGET.includes(url.pathname)

    ? 'GET'

    : 'POST'

  if (request.method !== metodoEsperado) {

    return json({ error: 'Método no permitido' }, 405, {

      Allow: metodoEsperado,

    })

  }

  if (

    request.method === 'POST' &&

    !comprobarOrigen(request)

  ) {

    return json({ error: 'Origen no autorizado' }, 403)

  }

  try {

    switch (url.pathname) {

      case '/api/auth/registro':

        return json({
          error: 'El registro por correo está temporalmente desactivado. Utiliza Google para registrarte.',
        }, 503)

      case '/api/auth/login':

        return await iniciarSesion(request, env)

      case '/api/auth/google':

        return await iniciarSesionGoogle(request, env)

      case '/api/auth/usuario':

        return await consultarUsuario(request, env)

      case '/api/auth/logout':

        return await cerrarSesion(request, env)

      case '/api/auth/verificar-email':

        return await verificarEmail(request, env)

      case '/api/auth/reenviar-verificacion': {

        const datos = await leerDatos(request)

        const email =

          typeof datos?.email === 'string'

            ? datos.email.trim().toLowerCase()

            : ''

        if (!validarEmail(email)) {

          return json({

            error: 'Introduce un correo electrónico válido',

          }, 400)

        }

        const limiteIP = await consumirIntento(

          request,

          env,

          'registro',

        )

        const limiteCuenta = await consumirIntento(

          request,

          env,

          'registro',

          email,

        )

        if (!limiteIP.permitido || !limiteCuenta.permitido) {

          return json({

            error: 'Demasiadas solicitudes. Inténtalo más tarde.',

          }, 429, {

            'Retry-After': String(Math.max(

              1,

              limiteIP.reintentarEn,

              limiteCuenta.reintentarEn,

            )),

          })

        }

        return await reenviarVerificacion(

          email,

          request,

          env,

        )

      }

      case '/api/auth/2fa/verificar':

        return await verificarSegundoFactor(request, env)

      case '/api/auth/2fa/preparar':

        return await preparar2FA(request, env)

      case '/api/auth/2fa/activar':

        return await activar2FA(request, env)

      case '/api/auth/2fa/estado':

        return await estado2FA(request, env)

      case '/api/auth/2fa/regenerar-recuperacion':

        return await regenerarCodigosRecuperacion(request, env)

      case '/api/auth/2fa/desactivar':

        return await desactivar2FA(request, env)

      default:

        return json({ error: 'Ruta no encontrada' }, 404)

    }

  } catch (error) {

    console.error('[EstadLiga Auth]', error)

    return json({

      error: 'Error interno de autenticación',

    }, 500)

  }

}

