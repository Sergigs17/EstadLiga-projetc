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

interface AuthEnv {
  estadliga_db: D1Database
}

interface UsuarioBD {
  id: number
  nombre: string
  email: string
  password_hash: string
  rol: 'usuario' | 'admin'
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

  return origen === new URL(request.url).origin
}

async function leerDatos(request: Request): Promise<DatosAuth | null> {
  const tipo = request.headers.get('Content-Type') ?? ''

  if (!tipo.toLowerCase().startsWith('application/json')) {
    return null
  }

  const longitud = Number(request.headers.get('Content-Length') ?? 0)

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
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

  try {
    const resultado = await env.estadliga_db
      .prepare(`
        INSERT INTO usuarios (nombre, email, password_hash, rol)
        VALUES (?, ?, ?, 'usuario')
      `)
      .bind(nombre, email, passwordHash)
      .run()

    if (!resultado.success) {
      return json({ error: 'No se ha podido crear la cuenta' }, 500)
    }

    return json({
      mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.',
    }, 201)
  } catch {
    return json({
      error: 'No se ha podido registrar esta cuenta',
    }, 409)
  }
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

  if (!validarEmail(email) || !password || password.length > 128) {
    return json({ error: 'Credenciales incorrectas' }, 401)
  }

  const usuario = await env.estadliga_db
    .prepare(`
      SELECT id, nombre, email, password_hash, rol
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

  // No crear una sesión sin comprobar primero el segundo factor.
  if (await tiene2FA(env, usuario.id)) {
    return json({
      requiere_2fa: true,
      mensaje: 'Se necesita verificar el segundo factor',
    }, 403)
  }

  const token = await crearSesion(env, usuario.id)

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
    '/api/auth/logout',
    '/api/auth/usuario',
  ]

  if (!rutas.includes(url.pathname)) {
    return json({ error: 'Ruta no encontrada' }, 404)
  }

  const metodoEsperado =
    url.pathname === '/api/auth/usuario' ? 'GET' : 'POST'

  if (request.method !== metodoEsperado) {
    return json({ error: 'Método no permitido' }, 405, {
      Allow: metodoEsperado,
    })
  }

  if (request.method === 'POST' && !comprobarOrigen(request)) {
    return json({ error: 'Origen no autorizado' }, 403)
  }

  try {
    switch (url.pathname) {
      case '/api/auth/registro':
        return await registrar(request, env)

      case '/api/auth/login':
        return await iniciarSesion(request, env)

      case '/api/auth/usuario':
        return await consultarUsuario(request, env)

      case '/api/auth/logout':
        return await cerrarSesion(request, env)

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
