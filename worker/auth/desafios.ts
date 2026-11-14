interface DesafiosEnv {
  estadliga_db: D1Database
}

interface DesafioBD {
  id: number
  usuario_id: number
}

const DURACION_DESAFIO = 5 * 60

function bytesAHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hashToken(token: string): Promise<string> {
  const datos = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', datos)

  return bytesAHex(new Uint8Array(hash))
}

export async function crearDesafio2FA(
  env: DesafiosEnv,
  usuarioId: number,
): Promise<string> {
  const token = bytesAHex(
    crypto.getRandomValues(new Uint8Array(32)),
  )

  const ahora = Math.floor(Date.now() / 1000)

  await env.estadliga_db
    .prepare(`
      INSERT INTO desafios_2fa (
        usuario_id,
        token_hash,
        creado_en,
        expira_en
      )
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      usuarioId,
      await hashToken(token),
      ahora,
      ahora + DURACION_DESAFIO,
    )
    .run()

  return token
}

export async function obtenerDesafio2FA(
  env: DesafiosEnv,
  token: string,
): Promise<DesafioBD | null> {
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return null
  }

  const ahora = Math.floor(Date.now() / 1000)

  return env.estadliga_db
    .prepare(`
      SELECT id, usuario_id
      FROM desafios_2fa
      WHERE token_hash = ?
        AND expira_en > ?
        AND utilizado_en IS NULL
      LIMIT 1
    `)
    .bind(await hashToken(token), ahora)
    .first<DesafioBD>()
}

export async function consumirDesafio2FA(
  env: DesafiosEnv,
  desafioId: number,
): Promise<boolean> {
  const ahora = Math.floor(Date.now() / 1000)

  const resultado = await env.estadliga_db
    .prepare(`
      UPDATE desafios_2fa
      SET utilizado_en = ?
      WHERE id = ?
        AND utilizado_en IS NULL
        AND expira_en > ?
    `)
    .bind(ahora, desafioId, ahora)
    .run()

  return resultado.meta.changes === 1
}

export async function limpiarDesafiosCaducados(
  env: DesafiosEnv,
): Promise<void> {
  const ahora = Math.floor(Date.now() / 1000)

  await env.estadliga_db
    .prepare(`
      DELETE FROM desafios_2fa
      WHERE expira_en < ?
         OR utilizado_en IS NOT NULL
    `)
    .bind(ahora)
    .run()
}
