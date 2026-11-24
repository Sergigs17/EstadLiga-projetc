
interface ApiFootballEnv {
  estadliga_db: D1Database
  API_FOOTBALL_KEY: string
}

interface ApiFootballFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string
    }
  }
  league: {
    id: number
    season: number
  }
  [key: string]: unknown
}

interface ApiFootballResponse {
  errors?: Record<string, unknown>
  response?: ApiFootballFixture[]
}

const LIMITE_DIARIO = 85
const LIGA_ESPAÑOLA = 140

export async function actualizarPartidosDirecto(
  env: ApiFootballEnv,
): Promise<void> {
  if (!env.API_FOOTBALL_KEY) {
    console.error('Falta API_FOOTBALL_KEY')
    return
  }

  const ahora = new Date()
  const fechaUTC = ahora.toISOString().slice(0, 10)

  // Reservar una petición sin superar nuestro límite diario.
  const reserva = await env.estadliga_db
    .prepare(`
      INSERT INTO api_football_control
        (fecha, peticiones, actualizado_en)
      VALUES (?, 1, ?)
      ON CONFLICT(fecha) DO UPDATE SET
        peticiones = peticiones + 1,
        actualizado_en = excluded.actualizado_en
      WHERE peticiones < ?
      RETURNING peticiones
    `)
    .bind(fechaUTC, ahora.toISOString(), LIMITE_DIARIO)
    .first<{ peticiones: number }>()

  if (!reserva) {
    console.log('Límite diario de API-Football alcanzado')
    return
  }

  try {
    const respuesta = await fetch(
      'https://v3.football.api-sports.io/fixtures?live=all',
      {
        headers: {
          'x-apisports-key': env.API_FOOTBALL_KEY,
        },
      },
    )

    if (!respuesta.ok) {
      throw new Error(`API-Football HTTP ${respuesta.status}`)
    }

    const datos =
      (await respuesta.json()) as ApiFootballResponse

    if (
      datos.errors &&
      Object.keys(datos.errors).length > 0
    ) {
      throw new Error(
        `API-Football: ${JSON.stringify(datos.errors)}`,
      )
    }

    const partidos = (datos.response ?? []).filter(
      (partido) => partido.league.id === LIGA_ESPAÑOLA,
    )

    for (const partido of partidos) {
      await env.estadliga_db
        .prepare(`
          INSERT INTO api_football_partidos
            (fixture_id, league_id, season, fecha,
             estado, actualizado_en, datos_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(fixture_id) DO UPDATE SET
            estado = excluded.estado,
            actualizado_en = excluded.actualizado_en,
            datos_json = excluded.datos_json
        `)
        .bind(
          partido.fixture.id,
          partido.league.id,
          partido.league.season,
          partido.fixture.date,
          partido.fixture.status.short,
          ahora.toISOString(),
          JSON.stringify(partido),
        )
        .run()
    }

    console.log(
      `API-Football: ${partidos.length} partidos de LaLiga actualizados`,
    )
  } catch (error) {
    console.error('Error actualizando API-Football:', error)
  }
}

export async function comprobarYActualizarDirecto(
  env: ApiFootballEnv,
): Promise<void> {
  const guardado = await env.estadliga_db
    .prepare('SELECT datos_json FROM partidos_cache WHERE id = 1')
    .first<{ datos_json: string }>()

  if (!guardado) {
    console.log('API-Football: calendario no disponible')
    return
  }

  const calendario = JSON.parse(guardado.datos_json) as {
    partidos?: Array<{
      fecha?: string
      estado?: string
    }>
  }

  const ahora = Date.now()

  const hayPartidoEnVentana = (
    calendario.partidos ?? []
  ).some((partido) => {
    if (!partido.fecha) return false

    if (
      partido.estado === 'FINISHED' ||
      partido.estado === 'CANCELLED' ||
      partido.estado === 'POSTPONED'
    ) {
      return false
    }

    const inicio = Date.parse(partido.fecha)
    if (!Number.isFinite(inicio)) return false

    return (
      ahora >= inicio - 5 * 60_000 &&
      ahora <= inicio + 180 * 60_000
    )
  })

  if (!hayPartidoEnVentana) {
    console.log('API-Football: sin partidos programados')
    return
  }

  await actualizarPartidosDirecto(env)
}
