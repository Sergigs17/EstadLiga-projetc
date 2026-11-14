interface RateLimitEnv {
  estadliga_db: D1Database
}

export type TipoRateLimit =
  | 'login'
  | 'registro'
  | '2fa_preparar'
  | '2fa_activar'
  | '2fa_verificar'

const CONFIGURACION = {
  login: {
    maxIntentos: 5,
    ventanaSegundos: 15 * 60,
  },
  registro: {
    maxIntentos: 3,
    ventanaSegundos: 60 * 60,
  },
  '2fa_preparar': {
    maxIntentos: 5,
    ventanaSegundos: 15 * 60,
  },
  '2fa_activar': {
    maxIntentos: 5,
    ventanaSegundos: 15 * 60,
  },
  '2fa_verificar': {
    maxIntentos: 5,
    ventanaSegundos: 5 * 60,
  },
} as const

interface RegistroIntentos {
  intentos: number
  ventana_inicio: number
}

export interface ResultadoRateLimit {
  permitido: boolean
  restantes: number
  reintentarEn: number
}

async function crearClave(
  identificador: string,
  tipo: TipoRateLimit,
): Promise<string> {
  const datos = new TextEncoder().encode(
    `${tipo}:${identificador}`,
  )

  const hash = await crypto.subtle.digest('SHA-256', datos)

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function consumirIntento(
  request: Request,
  env: RateLimitEnv,
  tipo: TipoRateLimit,
  identificadorCuenta?: string,
): Promise<ResultadoRateLimit> {
  const configuracion = CONFIGURACION[tipo]
  const ahora = Math.floor(Date.now() / 1000)

  const ip =
    request.headers.get('CF-Connecting-IP') ??
    'ip-no-disponible'

  const identificador = identificadorCuenta
    ? `cuenta:${identificadorCuenta.toLowerCase()}`
    : `ip:${ip}`

  const clave = await crearClave(identificador, tipo)

  const inicioVentana =
    Math.floor(ahora / configuracion.ventanaSegundos) *
    configuracion.ventanaSegundos

  const finVentana =
    inicioVentana + configuracion.ventanaSegundos

  // Incremento y lectura del contador en una única operación.
  const registro = await env.estadliga_db
    .prepare(`
      INSERT INTO auth_intentos (
        clave,
        intentos,
        ventana_inicio,
        bloqueado_hasta,
        actualizado_en
      )
      VALUES (?, 1, ?, 0, ?)
      ON CONFLICT(clave) DO UPDATE SET
        intentos = CASE
          WHEN auth_intentos.ventana_inicio = excluded.ventana_inicio
          THEN auth_intentos.intentos + 1
          ELSE 1
        END,
        ventana_inicio = excluded.ventana_inicio,
        bloqueado_hasta = 0,
        actualizado_en = excluded.actualizado_en
      RETURNING intentos, ventana_inicio
    `)
    .bind(clave, inicioVentana, ahora)
    .first<RegistroIntentos>()

  if (!registro) {
    return {
      permitido: false,
      restantes: 0,
      reintentarEn: configuracion.ventanaSegundos,
    }
  }

  const permitido = registro.intentos <= configuracion.maxIntentos

  return {
    permitido,
    restantes: Math.max(
      0,
      configuracion.maxIntentos - registro.intentos,
    ),
    reintentarEn: permitido
      ? 0
      : Math.max(1, finVentana - ahora),
  }
}

export async function limpiarIntentosAntiguos(
  env: RateLimitEnv,
): Promise<void> {
  const haceDosDias =
    Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60

  await env.estadliga_db
    .prepare(`
      DELETE FROM auth_intentos
      WHERE actualizado_en < ?
    `)
    .bind(haceDosDias)
    .run()
}
