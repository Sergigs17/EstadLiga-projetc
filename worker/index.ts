
interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  estadliga_db: D1Database
  estadliga_imagenes: R2Bucket
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

interface JugadorBD {
  id: number
  nombre: string
  apellido: string | null
  api_id: number | null
}

const URL_ESTADISTICAS =
  'https://superapis--sofascore.apify.actor/v1/player/statistics'

const CACHE_IMAGEN_VACIA = 'imagenes-sin-foto/'
const TIEMPO_CACHE_IMAGEN_VACIA = 60 * 60 * 24 * 7

async function obtenerEstadisticas(
  jugadorSofaScoreId: number,
  torneoId: number,
  temporadaId: number,
  token: string,
): Promise<{ ok: boolean; status: number; datos?: unknown }> {
  const apiUrl = new URL(URL_ESTADISTICAS)

  apiUrl.searchParams.set('player_id', String(jugadorSofaScoreId))
  apiUrl.searchParams.set('unique_tournament_id', String(torneoId))
  apiUrl.searchParams.set('season_id', String(temporadaId))
  apiUrl.searchParams.set('token', token)

  try {
    const response = await fetch(apiUrl.toString())

    if (!response.ok) {
      return { ok: false, status: response.status }
    }

    return {
      ok: true,
      status: response.status,
      datos: await response.json(),
    }
  } catch {
    return { ok: false, status: 502 }
  }
}

async function guardarEstadisticas(
  env: Env,
  jugadorId: number,
  torneoId: number,
  temporadaId: number,
  datos: unknown,
): Promise<void> {
  await env.estadliga_db
    .prepare(
      `INSERT INTO estadisticas_jugadores
        (jugador_id, unique_tournament_id, season_id,
         estadisticas_json, actualizado_en)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(jugador_id, unique_tournament_id, season_id)
       DO UPDATE SET
         estadisticas_json = excluded.estadisticas_json,
         actualizado_en = CURRENT_TIMESTAMP`,
    )
    .bind(
      jugadorId,
      torneoId,
      temporadaId,
      JSON.stringify(datos),
    )
    .run()
}

function respuestaError(
  mensaje: string,
  status: number,
  origen?: string,
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  if (origen) {
    headers.set('X-Imagen-Origen', origen)
  }

  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Comprobar el servidor.
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        app: 'EstadLiga',
        database: 'connected',
        message: 'El servidor funciona correctamente',
      })
    }

    // Obtener la imagen de un jugador.
    // Se busca primero en R2. Apify solo se utiliza si falta la imagen.
    // La ruta utiliza el ID interno de EstadLiga.
    const rutaImagen = url.pathname.match(
      /^\/api\/jugadores\/(\d+)\/imagen$/,
    )

    if (rutaImagen && request.method === 'GET') {
      const jugadorId = Number(rutaImagen[1])

      if (!Number.isInteger(jugadorId) || jugadorId <= 0) {
        return respuestaError('El ID del jugador no es válido', 400)
      }

      try {
        const jugador = await env.estadliga_db
          .prepare('SELECT api_id FROM jugadores WHERE id = ?')
          .bind(jugadorId)
          .first<{ api_id: number | null }>()

        if (!jugador) {
          return respuestaError(
            'No existe ese jugador en EstadLiga',
            404,
          )
        }

        if (
          jugador.api_id === null ||
          !Number.isInteger(jugador.api_id) ||
          jugador.api_id <= 0
        ) {
          return respuestaError(
            'El jugador no tiene un ID de SofaScore válido',
            404,
          )
        }

        const sofascoreId = jugador.api_id
        const claveImagen = `jugadores/${sofascoreId}`
        const claveSinImagen =
          `${CACHE_IMAGEN_VACIA}${sofascoreId}`

        // 1. Comprobar si la imagen ya está guardada en R2.
        const imagenGuardada =
          await env.estadliga_imagenes.get(claveImagen)

        if (imagenGuardada) {
          return new Response(imagenGuardada.body, {
            headers: {
              'Content-Type':
                imagenGuardada.httpMetadata?.contentType ??
                'application/octet-stream',
              'Cache-Control':
                'public, max-age=31536000, immutable',
              'X-Content-Type-Options': 'nosniff',
              'X-Imagen-Origen': 'R2',
            },
          })
        }

        // 2. Si ya se comprobó recientemente que no existe imagen,
        // evitar repetir la solicitud a Apify.
        const imagenNoDisponible =
          await env.estadliga_imagenes.head(claveSinImagen)

        if (imagenNoDisponible) {
          return respuestaError(
            'No hay una imagen disponible para este jugador',
            404,
            'R2-SIN-IMAGEN',
          )
        }

        if (!env.APIFY_TOKEN) {
          return respuestaError(
            'Falta configurar APIFY_TOKEN',
            500,
          )
        }

        // 3. Solicitar la imagen a Apify.
        const apiUrl = new URL(
          'https://superapis--sofascore.apify.actor/v1/player/image',
        )

        apiUrl.searchParams.set('player_id', String(sofascoreId))
        apiUrl.searchParams.set('token', env.APIFY_TOKEN)

        const respuesta = await fetch(apiUrl.toString())

        if (!respuesta.ok) {
          // Solo almacenar temporalmente los errores que indican
          // que no se encuentra la imagen. Los errores de servicio
          // o límites de uso no se guardan como ausencia permanente.
          if (respuesta.status === 404) {
            try {
              await env.estadliga_imagenes.put(
                claveSinImagen,
                'sin-imagen',
                {
                  customMetadata: {
                    motivo: 'imagen-no-encontrada',
                  },
                },
              )
            } catch {
              // Si falla R2, la petición sigue devolviendo el error.
            }
          }

          return respuestaError(
            'No se ha podido obtener la imagen del jugador',
            502,
            'Apify',
          )
        }

        const tipoContenido =
          respuesta.headers.get('content-type') ?? ''

        if (!tipoContenido.toLowerCase().startsWith('image/')) {
          return respuestaError(
            'Apify no ha devuelto una imagen válida',
            502,
            'Apify',
          )
        }

        // 4. Guardar la imagen en R2 para las siguientes visitas.
        const imagen = await respuesta.arrayBuffer()

        await env.estadliga_imagenes.put(
          claveImagen,
          imagen,
          {
            httpMetadata: {
              contentType: tipoContenido,
            },
          },
        )

        // 5. La primera respuesta procede de Apify.
        return new Response(imagen, {
          headers: {
            'Content-Type': tipoContenido,
            'Cache-Control':
              'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
            'X-Imagen-Origen': 'Apify',
          },
        })
      } catch (error) {
        return Response.json(
          {
            error:
              'No se ha podido obtener o guardar la imagen',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 502 },
        )
      }
    }

    // Obtener todos los equipos.
    if (url.pathname === '/api/equipos' && request.method === 'GET') {
      const { results } = await env.estadliga_db
        .prepare('SELECT * FROM equipos ORDER BY nombre')
        .all()

      return Response.json(results)
    }

    // Buscar equipos en SofaScore mediante Apify.
    if (
      url.pathname === '/api/buscar-equipos' &&
      request.method === 'GET'
    ) {
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
        const data: unknown = await response.json()

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
      } catch (error) {
        return Response.json(
          {
            error: 'No se ha podido consultar SofaScore',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 502 },
        )
      }
    }

    // Importación masiva de estadísticas por lotes.
    // POST /api/estadisticas/importar?unique_tournament_id=8&season_id=97268&offset=0&limite=5
    if (
      url.pathname === '/api/estadisticas/importar' &&
      request.method === 'POST'
    ) {
      const torneoId = Number(
        url.searchParams.get('unique_tournament_id'),
      )
      const temporadaId = Number(
        url.searchParams.get('season_id'),
      )
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const limite = Number(url.searchParams.get('limite') ?? 5)

      if (
        !Number.isInteger(torneoId) ||
        torneoId <= 0 ||
        !Number.isInteger(temporadaId) ||
        temporadaId <= 0 ||
        !Number.isInteger(offset) ||
        offset < 0 ||
        !Number.isInteger(limite) ||
        limite < 1 ||
        limite > 10
      ) {
        return Response.json(
          {
            error:
              'Parámetros no válidos. Usa torneo, temporada, offset >= 0 y limite entre 1 y 10.',
          },
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
        const resultado = await env.estadliga_db
          .prepare(
            `SELECT id, nombre, apellido, api_id
             FROM jugadores
             WHERE api_id IS NOT NULL
             ORDER BY id
             LIMIT ? OFFSET ?`,
          )
          .bind(limite, offset)
          .all<JugadorBD>()

        const jugadores = resultado.results

        const procesados: Array<{
          id: number
          jugador: string
          resultado: string
          estado?: number
        }> = []

        for (let i = 0; i < jugadores.length; i += 2) {
          const grupo = jugadores.slice(i, i + 2)

          const respuestas = await Promise.all(
            grupo.map(async (jugador) => {
              if (
                jugador.api_id === null ||
                !Number.isInteger(Number(jugador.api_id)) ||
                Number(jugador.api_id) <= 0
              ) {
                return {
                  jugador,
                  ok: false,
                  status: 400,
                  datos: undefined,
                }
              }

              const respuesta = await obtenerEstadisticas(
                Number(jugador.api_id),
                torneoId,
                temporadaId,
                env.APIFY_TOKEN,
              )

              return { jugador, ...respuesta }
            }),
          )

          for (const respuesta of respuestas) {
            const nombre =
              `${respuesta.jugador.nombre} ${respuesta.jugador.apellido ?? ''}`
                .trim()

            if (!respuesta.ok) {
              procesados.push({
                id: respuesta.jugador.id,
                jugador: nombre,
                resultado: 'error',
                estado: respuesta.status,
              })
              continue
            }

            try {
              await guardarEstadisticas(
                env,
                respuesta.jugador.id,
                torneoId,
                temporadaId,
                respuesta.datos,
              )

              procesados.push({
                id: respuesta.jugador.id,
                jugador: nombre,
                resultado: 'guardado',
              })
            } catch {
              procesados.push({
                id: respuesta.jugador.id,
                jugador: nombre,
                resultado: 'error_al_guardar',
              })
            }
          }
        }

        const total = await env.estadliga_db
          .prepare(
            'SELECT COUNT(*) AS total FROM jugadores WHERE api_id IS NOT NULL',
          )
          .first<{ total: number }>()

        const siguienteOffset = offset + jugadores.length

        return Response.json({
          mensaje: 'Lote de importación procesado',
          torneo_id: torneoId,
          temporada_id: temporadaId,
          offset,
          limite,
          jugadoresProcesados: jugadores.length,
          guardados: procesados.filter(
            (p) => p.resultado === 'guardado',
          ).length,
          errores: procesados.filter(
            (p) => p.resultado !== 'guardado',
          ).length,
          totalJugadoresConApiId: total?.total ?? 0,
          siguienteOffset:
            siguienteOffset < (total?.total ?? 0)
              ? siguienteOffset
              : null,
          resultados: procesados,
        })
      } catch (error) {
        return Response.json(
          {
            error: 'No se ha podido procesar el lote',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 500 },
        )
      }
    }

    // Consultar estadísticas de un jugador.
    // Primero intenta leerlas de D1; si no existen, las consulta y guarda.
    const rutaEstadisticas = url.pathname.match(
      /^\/api\/jugadores\/(\d+)\/estadisticas$/,
    )

    if (rutaEstadisticas && request.method === 'GET') {
      const jugadorId = Number(rutaEstadisticas[1])
      const torneoId = Number(
        url.searchParams.get('unique_tournament_id'),
      )
      const temporadaId = Number(
        url.searchParams.get('season_id'),
      )

      if (
        !Number.isInteger(jugadorId) ||
        jugadorId <= 0 ||
        !Number.isInteger(torneoId) ||
        torneoId <= 0 ||
        !Number.isInteger(temporadaId) ||
        temporadaId <= 0
      ) {
        return Response.json(
          {
            error:
              'Debes indicar un ID de jugador, unique_tournament_id y season_id válidos',
          },
          { status: 400 },
        )
      }

      try {
        const jugador = await env.estadliga_db
          .prepare(
            'SELECT id, nombre, apellido, api_id FROM jugadores WHERE id = ?',
          )
          .bind(jugadorId)
          .first<JugadorBD>()

        if (!jugador) {
          return Response.json(
            { error: 'No existe ese jugador en EstadLiga' },
            { status: 404 },
          )
        }

        const guardadas = await env.estadliga_db
          .prepare(
            `SELECT estadisticas_json, actualizado_en
             FROM estadisticas_jugadores
             WHERE jugador_id = ?
               AND unique_tournament_id = ?
               AND season_id = ?`,
          )
          .bind(jugadorId, torneoId, temporadaId)
          .first<{
            estadisticas_json: string
            actualizado_en: string
          }>()

        const nombre =
          `${jugador.nombre} ${jugador.apellido ?? ''}`.trim()

        if (guardadas) {
          return Response.json({
            jugador: {
              id: jugador.id,
              nombre,
              sofascore_id: jugador.api_id,
            },
            unique_tournament_id: torneoId,
            season_id: temporadaId,
            origen: 'D1',
            actualizado_en: guardadas.actualizado_en,
            datos: JSON.parse(guardadas.estadisticas_json),
          })
        }

        if (!jugador.api_id || !env.APIFY_TOKEN) {
          return Response.json(
            {
              error: !jugador.api_id
                ? 'El jugador no tiene un ID de SofaScore válido'
                : 'Falta configurar APIFY_TOKEN',
            },
            { status: !jugador.api_id ? 400 : 500 },
          )
        }

        const respuesta = await obtenerEstadisticas(
          jugador.api_id,
          torneoId,
          temporadaId,
          env.APIFY_TOKEN,
        )

        if (!respuesta.ok) {
          return Response.json(
            {
              error:
                'Error al obtener las estadísticas de SofaScore',
              status: respuesta.status,
            },
            { status: 502 },
          )
        }

        await guardarEstadisticas(
          env,
          jugadorId,
          torneoId,
          temporadaId,
          respuesta.datos,
        )

        return Response.json({
          jugador: {
            id: jugador.id,
            nombre,
            sofascore_id: jugador.api_id,
          },
          unique_tournament_id: torneoId,
          season_id: temporadaId,
          origen: 'SofaScore',
          datos: respuesta.datos,
        })
      } catch (error) {
        return Response.json(
          {
            error: 'No se han podido consultar las estadísticas',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 500 },
        )
      }
    }

    // Obtener jugadores guardados en D1.
    if (url.pathname === '/api/jugadores' && request.method === 'GET') {
      const equipoId = url.searchParams.get('equipo_id')

      let consulta =
        `SELECT jugadores.id, jugadores.nombre, jugadores.apellido,
         jugadores.posicion, jugadores.nacionalidad,
         jugadores.fecha_nacimiento, jugadores.dorsal,
         jugadores.equipo_id, jugadores.api_id,
         equipos.nombre AS equipo
         FROM jugadores
         LEFT JOIN equipos ON equipos.id = jugadores.equipo_id`

      if (equipoId) {
        const id = Number(equipoId)

        if (!Number.isInteger(id) || id <= 0) {
          return Response.json(
            { error: 'El ID del equipo no es válido' },
            { status: 400 },
          )
        }

        consulta += ' WHERE jugadores.equipo_id = ?'
        consulta += ' ORDER BY jugadores.dorsal'

        const resultado = await env.estadliga_db
          .prepare(consulta)
          .bind(id)
          .all()

        return Response.json(resultado.results)
      }

      consulta += ' ORDER BY jugadores.dorsal'

      const resultado = await env.estadliga_db
        .prepare(consulta)
        .all()

      return Response.json(resultado.results)
    }

    // Importar la plantilla de un equipo.
    const rutaImportacion = url.pathname.match(
      /^\/api\/equipos\/(\d+)\/jugadores\/importar$/,
    )

    if (rutaImportacion && request.method === 'POST') {
      const equipoId = Number(rutaImportacion[1])
      const sofascoreId = Number(
        url.searchParams.get('sofascore_id'),
      )

      if (
        !Number.isInteger(equipoId) ||
        equipoId <= 0 ||
        !Number.isInteger(sofascoreId) ||
        sofascoreId <= 0
      ) {
        return Response.json(
          {
            error:
              'Debes indicar un ID de equipo y un sofascore_id válidos',
          },
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
              error:
                'Error al obtener los jugadores de SofaScore',
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
              error:
                'SofaScore no ha devuelto jugadores válidos',
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
          const partes = jugador.name.trim().split(/\s+/)
          const nombre = partes.shift() || jugador.name
          const apellido = partes.join(' ') || null

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
              `INSERT INTO jugadores
                (nombre, apellido, posicion, nacionalidad,
                 fecha_nacimiento, dorsal, equipo_id, api_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(api_id) DO UPDATE SET
                 nombre = excluded.nombre,
                 apellido = excluded.apellido,
                 posicion = excluded.posicion,
                 nacionalidad = excluded.nacionalidad,
                 fecha_nacimiento = excluded.fecha_nacimiento,
                 dorsal = excluded.dorsal,
                 equipo_id = excluded.equipo_id`,
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

        for (let i = 0; i < consultas.length; i += 50) {
          await env.estadliga_db.batch(
            consultas.slice(i, i + 50),
          )
        }

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
    if (
      url.pathname === '/api/equipos/2817/jugadores' &&
      request.method === 'GET'
    ) {
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
        const data: unknown = await response.json()

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
      } catch (error) {
        return Response.json(
          {
            error: 'No se ha podido consultar los jugadores',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 502 },
        )
      }
    }

    // Probar la conexión con SofaScore.
    if (
      url.pathname === '/api/test-sofascore' &&
      request.method === 'GET'
    ) {
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
        const data: unknown = await response.json()

        if (!response.ok) {
          return Response.json(
            {
              error:
                'Error al consultar SofaScore mediante Apify',
              status: response.status,
            },
            { status: 502 },
          )
        }

        return Response.json(data)
      } catch (error) {
        return Response.json(
          {
            error:
              'No se ha podido conectar con SofaScore mediante Apify',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 502 },
        )
      }
    }

    // El resto de las peticiones se sirven desde los assets de Vite.
    return env.ASSETS.fetch(request)
  },
}
