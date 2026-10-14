
interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  estadliga_db: D1Database
  APIFY_TOKEN: string
}

interface JugadorSofaScore {
  id: number
  name: string
  position?: string
  shirtNumber?: number
  jerseyNumber?: string
  dateOfBirthTimestamp?: number
  country?: {
    name?: string
  }
}

interface RespuestaJugadores {
  players?: JugadorSofaScore[]
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        app: 'EstadLiga',
        database: 'connected',
        message: 'El servidor funciona correctamente',
      })
    }

    if (url.pathname === '/api/equipos') {
      const { results } = await env.estadliga_db
        .prepare('SELECT * FROM equipos ORDER BY nombre')
        .all()

      return Response.json(results)
    }

    if (url.pathname === '/api/buscar-equipos') {
      const consulta = url.searchParams.get('q') || 'Barcelona'

      if (!env.APIFY_TOKEN) {
        return Response.json(
          { error: 'Falta configurar APIFY_TOKEN' },
          { status: 500 },
        )
      }

      const apiUrl = new URL(
        'https://superapis--sofascore.apify.actor/v1/search/teams',
      )
      apiUrl.searchParams.set('q', consulta)
      apiUrl.searchParams.set('token', env.APIFY_TOKEN)

      try {
        const response = await fetch(apiUrl.toString())
        const data = await response.json()

        if (!response.ok) {
          return Response.json(
            { error: 'Error al buscar equipos', status: response.status },
            { status: 502 },
          )
        }

        return Response.json(data)
      } catch {
        return Response.json(
          { error: 'No se ha podido consultar SofaScore' },
          { status: 502 },
        )
      }
    }
    
    if (url.pathname === '/api/jugadores') {
      const equipoId = url.searchParams.get('equipo_id')

      let consulta = `
        SELECT
          jugadores.id,
          jugadores.nombre,
          jugadores.apellido,
          jugadores.posicion,
          jugadores.nacionalidad,
          jugadores.fecha_nacimiento,
          jugadores.dorsal,
          jugadores.equipo_id,
          jugadores.api_id,
          equipos.nombre AS equipo
        FROM jugadores
        LEFT JOIN equipos ON equipos.id = jugadores.equipo_id
      `

      if (equipoId) {
        consulta += ' WHERE jugadores.equipo_id = ?'
      }

      consulta += ' ORDER BY jugadores.dorsal'

      const resultado = equipoId
        ? await env.estadliga_db
            .prepare(consulta)
            .bind(Number(equipoId))
            .all()
        : await env.estadliga_db
            .prepare(consulta)
            .all()

      return Response.json(resultado.results)
    }

    if (url.pathname === '/api/equipos/2817/jugadores') {
      if (!env.APIFY_TOKEN) {
        return Response.json(
          { error: 'Falta configurar APIFY_TOKEN' },
          { status: 500 },
        )
      }

      const apiUrl = new URL(
        'https://superapis--sofascore.apify.actor/v1/team/players',
      )
      apiUrl.searchParams.set('team_id', '2817')
      apiUrl.searchParams.set('token', env.APIFY_TOKEN)

      try {
        const response = await fetch(apiUrl.toString())
        const data = await response.json()

        if (!response.ok) {
          return Response.json(
            {
              error: 'Error al consultar los jugadores',
              status: response.status,
            },
            { status: 502 },
          )
        }

        return Response.json(data)
      } catch {
        return Response.json(
          { error: 'No se ha podido consultar los jugadores' },
          { status: 502 },
        )
      }
    }

    if (
      url.pathname === '/api/equipos/2817/jugadores/importar' &&
      request.method === 'POST'
    ) {
      if (!env.APIFY_TOKEN) {
        return Response.json(
          { error: 'Falta configurar APIFY_TOKEN' },
          { status: 500 },
        )
      }

      try {
        const apiUrl = new URL(
          'https://superapis--sofascore.apify.actor/v1/team/players',
        )
        apiUrl.searchParams.set('team_id', '2817')
        apiUrl.searchParams.set('token', env.APIFY_TOKEN)

        const response = await fetch(apiUrl.toString())

        if (!response.ok) {
          return Response.json(
            {
              error: 'Error al obtener los jugadores',
              status: response.status,
            },
            { status: 502 },
          )
        }

        const data = await response.json() as RespuestaJugadores
        const jugadores = data.players ?? []

        if (jugadores.length === 0) {
          return Response.json(
            { error: 'La API no ha devuelto jugadores para importar' },
            { status: 502 },
          )
        }

        const posiciones: Record<string, string> = {
          G: 'Portero',
          D: 'Defensa',
          M: 'Centrocampista',
          F: 'Delantero',
        }

        const consultas = jugadores.map((jugador) => {
          const nombreCompleto = jugador.name.trim()
          const partesNombre = nombreCompleto.split(/\s+/)
          const apellido = partesNombre.length > 1
            ? partesNombre.pop()!
            : null
          const nombre = partesNombre.join(' ') || nombreCompleto

          const fechaNacimiento = jugador.dateOfBirthTimestamp
            ? new Date(jugador.dateOfBirthTimestamp * 1000)
                .toISOString()
                .slice(0, 10)
            : null

          const dorsal = jugador.shirtNumber ??
            (jugador.jerseyNumber
              ? Number.parseInt(jugador.jerseyNumber, 10)
              : null)

          return env.estadliga_db.prepare(`
            INSERT INTO jugadores (
              nombre,
              apellido,
              posicion,
              nacionalidad,
              fecha_nacimiento,
              dorsal,
              equipo_id,
              api_id
            )
            VALUES (?, ?, ?, ?, ?, ?, 7, ?)
            ON CONFLICT(api_id) DO UPDATE SET
              nombre = excluded.nombre,
              apellido = excluded.apellido,
              posicion = excluded.posicion,
              nacionalidad = excluded.nacionalidad,
              fecha_nacimiento = excluded.fecha_nacimiento,
              dorsal = excluded.dorsal,
              equipo_id = 7
          `).bind(
            nombre,
            apellido,
            posiciones[jugador.position ?? ''] ??
              jugador.position ??
              null,
            jugador.country?.name ?? null,
            fechaNacimiento,
            dorsal !== null && Number.isFinite(dorsal)
              ? dorsal
              : null,
            jugador.id,
          )
        })

        for (let i = 0; i < consultas.length; i += 50) {
          await env.estadliga_db.batch(
            consultas.slice(i, i + 50),
          )
        }

        return Response.json({
          mensaje: 'Importación completada',
          equipo: 'FC Barcelona',
          equipo_id: 7,
          jugadoresImportados: jugadores.length,
        })
      } catch {
        return Response.json(
          { error: 'No se han podido importar los jugadores' },
          { status: 500 },
        )
      }
    }

    if (url.pathname === '/api/test-sofascore') {
      if (!env.APIFY_TOKEN) {
        return Response.json(
          { error: 'Falta configurar APIFY_TOKEN' },
          { status: 500 },
        )
      }

      const apiUrl = new URL(
        'https://superapis--sofascore.apify.actor/v1/search/teams',
      )
      apiUrl.searchParams.set('q', 'Barcelona')
      apiUrl.searchParams.set('token', env.APIFY_TOKEN)

      try {
        const response = await fetch(apiUrl.toString())
        const data = await response.json()

        if (!response.ok) {
          return Response.json(
            {
              error: 'Error al consultar SofaScore mediante Apify',
              status: response.status,
            },
            { status: 502 },
          )
        }

        return Response.json(data)
      } catch {
        return Response.json(
          {
            error: 'No se ha podido conectar con SofaScore mediante Apify',
          },
          { status: 502 },
        )
      }
    }

    return env.ASSETS.fetch(request)
  },
}
