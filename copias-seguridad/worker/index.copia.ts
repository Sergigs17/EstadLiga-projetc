
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

    // Comprobar que el servidor funciona.
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        app: 'EstadLiga',
        database: 'connected',
        message: 'El servidor funciona correctamente',
      })
    }

    // Obtener todos los equipos.
    if (url.pathname === '/api/equipos') {
      const { results } = await env.estadliga_db
        .prepare('SELECT * FROM equipos ORDER BY nombre')
        .all()

      return Response.json(results)
    }

    // Buscar equipos en SofaScore mediante Apify.
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
            {
              error: 'Error al buscar equipos',
              status: response.status,
            },
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

    // Obtener los jugadores guardados en D1.
    if (url.pathname === '/api/jugadores') {
      const equipoId = url.searchParams.get('equipo_id')

      const consultaBase =
        'SELECT jugadores.id, jugadores.nombre, jugadores.apellido, ' +
        'jugadores.posicion, jugadores.nacionalidad, ' +
        'jugadores.fecha_nacimiento, jugadores.dorsal, ' +
        'jugadores.equipo_id, jugadores.api_id, ' +
        'equipos.nombre AS equipo ' +
        'FROM jugadores ' +
        'LEFT JOIN equipos ON equipos.id = jugadores.equipo_id'

      let consulta = consultaBase

      if (equipoId) {
        const id = Number(equipoId)

        if (!Number.isInteger(id) || id <= 0) {
          return Response.json(
            { error: 'El ID del equipo no es válido' },
            { status: 400 },
          )
        }

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

    // Importar los jugadores de un equipo.
    // El ID de la ruta es el ID interno de EstadLiga.
    // sofascore_id es el ID del equipo en SofaScore.
    const rutaImportacion = url.pathname.match(
      /^\/api\/equipos\/(\d+)\/jugadores\/importar$/,
    )

    if (rutaImportacion && request.method === 'POST') {
      const equipoId = Number(rutaImportacion[1])
      const sofascoreId = Number(
        url.searchParams.get('sofascore_id'),
      )

      if (!Number.isInteger(sofascoreId) || sofascoreId <= 0) {
        return Response.json(
          { error: 'Debes indicar un sofascore_id válido en la URL' },
          { status: 400 },
        )
      }

      if (!env.APIFY_TOKEN) {
        return Response.json(
          { error: 'Falta configurar APIFY_TOKEN' },
          { status: 500 },
        )
      }

      try {
        const equipo = await env.estadliga_db
          .prepare('SELECT id, nombre FROM equipos WHERE id = ?')
          .bind(equipoId)
          .first<{ id: number; nombre: string }>()

        if (!equipo) {
          return Response.json(
            { error: 'No existe ese equipo en la base de datos' },
            { status: 404 },
          )
        }

        const apiUrl = new URL(
          'https://superapis--sofascore.apify.actor/v1/team/players',
        )

        apiUrl.searchParams.set('team_id', String(sofascoreId))
        apiUrl.searchParams.set('token', env.APIFY_TOKEN)

        const response = await fetch(apiUrl.toString())

        if (!response.ok) {
          return Response.json(
            {
              error: 'Error al obtener los jugadores de SofaScore',
              status: response.status,
            },
            { status: 502 },
          )
        }

        const data =
          (await response.json()) as RespuestaJugadores

        const jugadores = (data.players ?? []).filter(
          (jugador) =>
            Number.isInteger(jugador.id) &&
            jugador.id > 0 &&
            typeof jugador.name === 'string' &&
            jugador.name.trim().length > 0,
        )

        if (jugadores.length === 0) {
          return Response.json(
            {
              error: 'SofaScore no ha devuelto jugadores válidos',
              equipo: equipo.nombre,
            },
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

          // Conservar el resto del nombre como apellido.
          const nombre = partesNombre.shift() || nombreCompleto
          const apellido = partesNombre.join(' ') || null

          const fechaNacimiento =
            jugador.dateOfBirthTimestamp &&
            Number.isFinite(jugador.dateOfBirthTimestamp)
              ? new Date(
                  jugador.dateOfBirthTimestamp * 1000,
                )
                  .toISOString()
                  .slice(0, 10)
              : null

          const dorsal =
            jugador.shirtNumber ??
            (jugador.jerseyNumber
              ? Number.parseInt(jugador.jerseyNumber, 10)
              : null)

          return env.estadliga_db
            .prepare(
              'INSERT INTO jugadores (' +
                'nombre, apellido, posicion, nacionalidad, ' +
                'fecha_nacimiento, dorsal, equipo_id, api_id' +
                ') VALUES (?, ?, ?, ?, ?, ?, ?, ?) ' +
                'ON CONFLICT(api_id) DO UPDATE SET ' +
                'nombre = excluded.nombre, ' +
                'apellido = excluded.apellido, ' +
                'posicion = excluded.posicion, ' +
                'nacionalidad = excluded.nacionalidad, ' +
                'fecha_nacimiento = excluded.fecha_nacimiento, ' +
                'dorsal = excluded.dorsal, ' +
                'equipo_id = excluded.equipo_id',
            )
            .bind(
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
              equipoId,
              jugador.id,
            )
        })

        // Guardar la plantilla en lotes.
        for (let i = 0; i < consultas.length; i += 50) {
          await env.estadliga_db.batch(
            consultas.slice(i, i + 50),
          )
        }

        // Guardar el ID externo del equipo.
        await env.estadliga_db
          .prepare('UPDATE equipos SET api_id = ? WHERE id = ?')
          .bind(sofascoreId, equipoId)
          .run()

        return Response.json({
          mensaje: 'Importación completada',
          equipo: equipo.nombre,
          equipo_id: equipoId,
          sofascore_id: sofascoreId,
          jugadoresImportados: jugadores.length,
        })
      } catch (error) {
        return Response.json(
          {
            error: 'No se ha podido completar la importación',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 500 },
        )
      }
    }

    // Consultar directamente la plantilla del Barça.
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

    // Probar la conexión con SofaScore mediante Apify.
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

    // Servir el resto de la aplicación.
    return env.ASSETS.fetch(request)
  },
}
