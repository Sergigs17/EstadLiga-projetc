interface RecuperacionEnv {
  estadliga_db: D1Database
}

const TOTAL_CODIGOS = 10

function generarCodigo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))

  const hexadecimal = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

  return hexadecimal.match(/.{1,6}/g)!.join('-')
}

export async function calcularHashCodigoRecuperacion(codigo: string): Promise<string> {
  const normalizado = codigo
    .replace(/-/g, '')
    .trim()
    .toUpperCase()

  const datos = new TextEncoder().encode(normalizado)
  const hash = await crypto.subtle.digest('SHA-256', datos)

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function prepararCodigosRecuperacion(): Promise<{
  codigos: string[]
  hashes: string[]
}> {
  const codigos = Array.from(
    { length: TOTAL_CODIGOS },
    () => generarCodigo(),
  )

  const hashes = await Promise.all(
    codigos.map(calcularHashCodigoRecuperacion),
  )

  return { codigos, hashes }
}

export function consultasGuardarCodigosRecuperacion(
  env: RecuperacionEnv,
  usuarioId: number,
  hashes: string[],
): D1PreparedStatement[] {
  if (hashes.length !== TOTAL_CODIGOS) {
    throw new Error('Cantidad de códigos de recuperación no válida')
  }

  return [
    env.estadliga_db
      .prepare(`
        DELETE FROM codigos_recuperacion_2fa
        WHERE usuario_id = ?
      `)
      .bind(usuarioId),

    ...hashes.map((hash) =>
      env.estadliga_db
        .prepare(`
          INSERT INTO codigos_recuperacion_2fa (
            usuario_id,
            codigo_hash
          )
          VALUES (?, ?)
        `)
        .bind(usuarioId, hash),
    ),
  ]
}

export async function consumirCodigoRecuperacion(
  env: RecuperacionEnv,
  usuarioId: number,
  codigo: string,
): Promise<boolean> {
  if (
    !/^[0-9a-fA-F]{6}(?:-?[0-9a-fA-F]{6}){3}$/.test(
      codigo.trim(),
    )
  ) {
    return false
  }

  const hash = await calcularHashCodigoRecuperacion(codigo)

  const resultado = await env.estadliga_db
    .prepare(`
      UPDATE codigos_recuperacion_2fa
      SET utilizado_en = CURRENT_TIMESTAMP
      WHERE usuario_id = ?
        AND codigo_hash = ?
        AND utilizado_en IS NULL
    `)
    .bind(usuarioId, hash)
    .run()

  return resultado.meta.changes === 1
}

export async function contarCodigosDisponibles(
  env: RecuperacionEnv,
  usuarioId: number,
): Promise<number> {
  const resultado = await env.estadliga_db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM codigos_recuperacion_2fa
      WHERE usuario_id = ?
        AND utilizado_en IS NULL
    `)
    .bind(usuarioId)
    .first<{ total: number }>()

  return resultado?.total ?? 0
}
