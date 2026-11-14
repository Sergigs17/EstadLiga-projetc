interface Env {
  estadliga_db: D1Database
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const db = env.estadliga_db

    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS prueba_activacion_2fa (
          id INTEGER PRIMARY KEY,
          activado INTEGER NOT NULL DEFAULT 0
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS prueba_codigos_2fa (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          codigo_hash TEXT NOT NULL UNIQUE
        )
      `),
    ])

    async function reiniciar() {
      await db.batch([
        db.prepare('DELETE FROM prueba_codigos_2fa'),
        db.prepare(`
          INSERT INTO prueba_activacion_2fa (id, activado)
          VALUES (1, 0)
          ON CONFLICT(id) DO UPDATE SET activado = 0
        `),
      ])
    }

    function operaciones() {
      return [
        db.prepare(`
          UPDATE prueba_activacion_2fa
          SET activado = 1
          WHERE id = 1 AND activado = 0
        `),
        db.prepare(`
          SELECT CASE
            WHEN changes() = 1 THEN 1
            ELSE json_extract('invalid-json', '$')
          END AS comprobacion
        `),
        db.prepare('DELETE FROM prueba_codigos_2fa WHERE usuario_id = 1'),
        ...Array.from({ length: 10 }, (_, i) =>
          db.prepare(`
            INSERT INTO prueba_codigos_2fa (usuario_id, codigo_hash)
            VALUES (1, ?)
          `).bind(`hash-prueba-${i}`)
        ),
      ]
    }

    async function estado() {
      const usuario = await db.prepare(
        'SELECT activado FROM prueba_activacion_2fa WHERE id = 1'
      ).first<{ activado: number }>()

      const codigos = await db.prepare(
        'SELECT COUNT(*) AS total FROM prueba_codigos_2fa WHERE usuario_id = 1'
      ).first<{ total: number }>()

      return {
        activado: usuario?.activado ?? null,
        codigos: codigos?.total ?? null,
      }
    }

    await reiniciar()

    await db.batch(operaciones())
    const correcto = await estado()

    let errorDetectado = false

    try {
      await db.batch(operaciones())
    } catch {
      errorDetectado = true
    }

    const despuesDelFallo = await estado()

    const superada =
      correcto.activado === 1 &&
      correcto.codigos === 10 &&
      errorDetectado &&
      despuesDelFallo.activado === 1 &&
      despuesDelFallo.codigos === 10

    return new Response(
      JSON.stringify({
        prueba: superada ? 'SUPERADA' : 'FALLIDA',
        activacionCorrecta: correcto,
        errorDetectado,
        despuesDelFallo,
      }, null, 2),
      {
        status: superada ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  },
}
