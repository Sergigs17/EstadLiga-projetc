interface Env {
  estadliga_db: D1Database
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const db = env.estadliga_db

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS prueba_batch_2fa (
        id INTEGER PRIMARY KEY,
        consumido INTEGER NOT NULL DEFAULT 0
      )
    `).run()

    await db.prepare(`
      INSERT INTO prueba_batch_2fa (id, consumido)
      VALUES (1, 0)
      ON CONFLICT(id) DO UPDATE SET consumido = 0
    `).run()

    let errorDetectado = false

    try {
      await db.batch([
        db.prepare(`
          UPDATE prueba_batch_2fa
          SET consumido = 1
          WHERE id = 1 AND consumido = 0
        `),

        db.prepare(`
          SELECT CASE
            WHEN changes() = 1 THEN 1
            ELSE json_extract('invalid-json', '$')
          END
        `),

        db.prepare(`
          UPDATE prueba_batch_2fa
          SET consumido = 1
          WHERE id = 999
        `),

        db.prepare(`
          SELECT CASE
            WHEN changes() = 1 THEN 1
            ELSE json_extract('invalid-json', '$')
          END
        `),
      ])
    } catch {
      errorDetectado = true
    }

    const resultado = await db.prepare(`
      SELECT consumido
      FROM prueba_batch_2fa
      WHERE id = 1
    `).first<{ consumido: number }>()

    const superada =
      errorDetectado && resultado?.consumido === 0

    return new Response(
      JSON.stringify({
        prueba: superada ? 'SUPERADA' : 'FALLIDA',
        errorDetectado,
        consumido: resultado?.consumido ?? null,
      }, null, 2),
      {
        status: superada ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  },
}
