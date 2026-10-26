
interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  estadliga_db: D1Database
  estadliga_imagenes: R2Bucket
  APIFY_TOKEN: string
  FOOTBALL_DATA_API_TOKEN: string
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

interface EquipoBD {
  id: number
  nombre: string
  api_id: number | null
}

const URL_ESTADISTICAS_EQUIPOS =
  'https://superapis--sofascore.apify.actor/v1/team/statistics'

async function obtenerEstadisticasEquipo(
  equipoSofaScoreId: number,
  torneoId: number,
  temporadaId: number,
  token: string,
): Promise<{ ok: boolean; status: number; datos?: unknown }> {
  const apiUrl = new URL(URL_ESTADISTICAS_EQUIPOS)

  apiUrl.searchParams.set('team_id', String(equipoSofaScoreId))
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

async function guardarEstadisticasEquipo(
  env: Env,
  equipoId: number,
  torneoId: number,
  temporadaId: number,
  datos: unknown,
): Promise<void> {
  await env.estadliga_db
    .prepare(
      `INSERT INTO estadisticas_equipos
        (equipo_id, unique_tournament_id, season_id,
         estadisticas_json, actualizado_en)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(equipo_id, unique_tournament_id, season_id)
       DO UPDATE SET
         estadisticas_json = excluded.estadisticas_json,
         actualizado_en = CURRENT_TIMESTAMP`,
    )
    .bind(
      equipoId,
      torneoId,
      temporadaId,
      JSON.stringify(datos),
    )
    .run()
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

const TORNEO_LALIGA = 8
const TEMPORADA_LALIGA = 97268
const JUGADORES_ESTADISTICAS_POR_DIA = 25

/** Actualiza la plantilla de un equipo sin borrar jugadores históricos. */
async function actualizarPlantillaProgramada(
  env: Env,
  equipo: EquipoBD,
  token: string,
): Promise<number> {
  if (!equipo.api_id || !Number.isInteger(equipo.api_id) || equipo.api_id <= 0) {
    throw new Error(`El equipo ${equipo.nombre} no tiene un api_id válido`)
  }

  const apiUrl = new URL(
    'https://superapis--sofascore.apify.actor/v1/team/players',
  )
  apiUrl.searchParams.set('team_id', String(equipo.api_id))
  apiUrl.searchParams.set('token', token)

  const response = await fetch(apiUrl.toString())
  if (!response.ok) {
    throw new Error(`SofaScore respondió ${response.status} al consultar ${equipo.nombre}`)
  }

  const data = (await response.json()) as RespuestaJugadores
  const jugadores = (data.players ?? []).filter(
    (jugador) =>
      Number.isInteger(jugador.id) &&
      jugador.id > 0 &&
      typeof jugador.name === 'string' &&
      jugador.name.trim().length > 0,
  )

  // No modificar la base de datos si SofaScore devuelve una respuesta vacía.
  if (jugadores.length === 0) {
    throw new Error(`SofaScore no devolvió jugadores válidos para ${equipo.nombre}`)
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
      jugador.dateOfBirthTimestamp && Number.isFinite(jugador.dateOfBirthTimestamp)
        ? new Date(jugador.dateOfBirthTimestamp * 1000).toISOString().slice(0, 10)
        : null
    const dorsal = jugador.shirtNumber ??
      (jugador.jerseyNumber ? Number.parseInt(jugador.jerseyNumber, 10) : null)

    return env.estadliga_db.prepare(
      `INSERT INTO jugadores
        (nombre, apellido, posicion, nacionalidad, fecha_nacimiento, dorsal, equipo_id, api_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(api_id) DO UPDATE SET
         nombre = excluded.nombre,
         apellido = excluded.apellido,
         posicion = excluded.posicion,
         nacionalidad = excluded.nacionalidad,
         fecha_nacimiento = excluded.fecha_nacimiento,
         dorsal = excluded.dorsal,
         equipo_id = excluded.equipo_id`,
    ).bind(
      nombre,
      apellido,
      posiciones[jugador.position ?? ''] ?? jugador.position ?? null,
      jugador.country?.name ?? null,
      fechaNacimiento,
      dorsal !== null && Number.isFinite(dorsal) ? dorsal : null,
      equipo.id,
      jugador.id,
    )
  })

  for (let i = 0; i < consultas.length; i += 50) {
    await env.estadliga_db.batch(consultas.slice(i, i + 50))
  }
  return jugadores.length
}

async function ejecutarActualizacionDiaria(env: Env): Promise<void> {
  if (!env.APIFY_TOKEN) {
    console.error('[EstadLiga cron] Falta APIFY_TOKEN; se cancela la actualización.')
    return
  }

  const equiposResult = await env.estadliga_db
    .prepare('SELECT id, nombre, api_id FROM equipos WHERE api_id IS NOT NULL ORDER BY id')
    .all<EquipoBD>()
  const equipos = equiposResult.results

  let plantillasOk = 0
  let erroresPlantillas = 0
  let estadisticasEquiposOk = 0
  let erroresEstadisticasEquipos = 0
  let estadisticasJugadoresOk = 0
  let erroresEstadisticasJugadores = 0

  // Actualizar plantillas en grupos de dos para limitar las llamadas simultáneas.
  for (let i = 0; i < equipos.length; i += 2) {
    const grupo = equipos.slice(i, i + 2)
    await Promise.all(grupo.map(async (equipo) => {
      try {
        const total = await actualizarPlantillaProgramada(env, equipo, env.APIFY_TOKEN)
        plantillasOk++
        console.log(`[EstadLiga cron] Plantilla actualizada: ${equipo.nombre} (${total} jugadores)`)
      } catch (error) {
        erroresPlantillas++
        console.error(`[EstadLiga cron] Error de plantilla en ${equipo.nombre}:`, error)
      }
    }))
  }

  // Actualizar las estadísticas de los equipos para LaLiga y la temporada configurada.
  for (let i = 0; i < equipos.length; i += 2) {
    const grupo = equipos.slice(i, i + 2)
    await Promise.all(grupo.map(async (equipo) => {
      if (!equipo.api_id) return
      try {
        const respuesta = await obtenerEstadisticasEquipo(
          equipo.api_id, TORNEO_LALIGA, TEMPORADA_LALIGA, env.APIFY_TOKEN,
        )
        if (!respuesta.ok) throw new Error(`SofaScore respondió ${respuesta.status}`)
        await guardarEstadisticasEquipo(
          env, equipo.id, TORNEO_LALIGA, TEMPORADA_LALIGA, respuesta.datos,
        )
        estadisticasEquiposOk++
      } catch (error) {
        erroresEstadisticasEquipos++
        console.error(`[EstadLiga cron] Error de estadísticas del equipo ${equipo.nombre}:`, error)
      }
    }))
  }

  // Refrescar un lote de jugadores cada día, priorizando los que llevan más tiempo sin actualizar.
  const jugadoresResult = await env.estadliga_db.prepare(
    `SELECT j.id, j.nombre, j.apellido, j.api_id
     FROM jugadores j
     LEFT JOIN estadisticas_jugadores e
       ON e.jugador_id = j.id
       AND e.unique_tournament_id = ?
       AND e.season_id = ?
     WHERE j.api_id IS NOT NULL
     ORDER BY CASE WHEN e.actualizado_en IS NULL THEN 0 ELSE 1 END,
              e.actualizado_en ASC, j.id ASC
     LIMIT ?`,
  ).bind(TORNEO_LALIGA, TEMPORADA_LALIGA, JUGADORES_ESTADISTICAS_POR_DIA)
    .all<JugadorBD>()
  const jugadores = jugadoresResult.results

  for (let i = 0; i < jugadores.length; i += 2) {
    const grupo = jugadores.slice(i, i + 2)
    await Promise.all(grupo.map(async (jugador) => {
      if (!jugador.api_id) return
      try {
        const respuesta = await obtenerEstadisticas(
          jugador.api_id, TORNEO_LALIGA, TEMPORADA_LALIGA, env.APIFY_TOKEN,
        )
        if (!respuesta.ok) throw new Error(`SofaScore respondió ${respuesta.status}`)
        await guardarEstadisticas(
          env, jugador.id, TORNEO_LALIGA, TEMPORADA_LALIGA, respuesta.datos,
        )
        estadisticasJugadoresOk++
      } catch (error) {
        erroresEstadisticasJugadores++
        console.error(`[EstadLiga cron] Error de estadísticas del jugador ${jugador.id}:`, error)
      }
    }))
  }

  console.log('[EstadLiga cron] Resumen diario', {
    equipos: equipos.length,
    plantillasOk,
    erroresPlantillas,
    estadisticasEquiposOk,
    erroresEstadisticasEquipos,
    jugadoresProcesados: jugadores.length,
    estadisticasJugadoresOk,
    erroresEstadisticasJugadores,
    torneo: TORNEO_LALIGA,
    temporada: TEMPORADA_LALIGA,
  })
}
async function actualizarCachesFootballData(env: Env): Promise<void> {
  const ahora = new Date();

  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);

  const dia = partes.find((p) => p.type === "weekday")?.value;
  const hora = Number(
    partes.find((p) => p.type === "hour")?.value,
  );

  const diasPermitidos = ["Fri", "Sat", "Sun", "Mon"];

  // Solo viernes, sábado, domingo y lunes, de 12:00 a 23:00.
  if (!diasPermitidos.includes(dia ?? "") || hora < 12 || hora > 23) {
    return;
  }

  const token = env.FOOTBALL_DATA_API_TOKEN;

  if (!token) {
    console.error("Falta FOOTBALL_DATA_API_TOKEN.");
    return;
  }

  const actualizadoEn = new Date().toISOString();
  const cabeceras = { "X-Auth-Token": token };

  // 1. Actualizar clasificación.
  try {
    const respuesta = await fetch(
      "https://api.football-data.org/v4/competitions/PD/standings",
      { headers: cabeceras },
    );

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    await env.estadliga_db
      .prepare(`
        INSERT INTO clasificacion_cache (id, datos_json, actualizado_en)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          datos_json = excluded.datos_json,
          actualizado_en = excluded.actualizado_en
      `)
      .bind(JSON.stringify(datos), actualizadoEn)
      .run();

    console.log("Clasificación actualizada correctamente.");
  } catch (error) {
    console.error("Error actualizando la clasificación:", error);
  }

  // 2. Actualizar calendario de partidos.
  try {
    const respuesta = await fetch(
      "https://api.football-data.org/v4/competitions/PD/matches",
      { headers: cabeceras },
    );

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    const datos = (await respuesta.json()) as {
      matches?: Array<{
        matchday?: number | null;
        status?: string;
        utcDate?: string;
        homeTeam?: { name?: string };
        awayTeam?: { name?: string };
        score?: {
          fullTime?: {
            home?: number | null;
            away?: number | null;
          };
        };
      }>;
    };

    const partidos = {
      partidos: (datos.matches ?? []).map((partido) => ({
        jornada: partido.matchday ?? null,
        estado: partido.status ?? "",
        fecha: partido.utcDate ?? "",
        local: partido.homeTeam?.name ?? "",
        visitante: partido.awayTeam?.name ?? "",
        golesLocal: partido.score?.fullTime?.home ?? null,
        golesVisitante: partido.score?.fullTime?.away ?? null,
      })),
    };

    await env.estadliga_db
      .prepare(`
        INSERT INTO partidos_cache (id, datos_json, actualizado_en)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          datos_json = excluded.datos_json,
          actualizado_en = excluded.actualizado_en
      `)
      .bind(JSON.stringify(partidos), actualizadoEn)
      .run();

    console.log("Partidos actualizados correctamente.");
  } catch (error) {
    console.error("Error actualizando los partidos:", error);
  }
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

    // Consultar la clasificación de LaLiga.
    // GET /api/clasificacion
    if (
      url.pathname === '/api/clasificacion' &&
      request.method === 'GET'
    ) {
      try {
        // Primero, consultar la clasificación guardada en D1.
        const guardada = await env.estadliga_db
          .prepare(
            'SELECT datos_json FROM clasificacion_cache WHERE id = 1',
          )
          .first<{ datos_json: string }>()

        if (guardada) {
          return new Response(guardada.datos_json, {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=300',
            },
          })
        }

        // Solo consultar la API externa si todavía no hay datos guardados.
        if (!env.FOOTBALL_DATA_API_TOKEN) {
          return Response.json(
            { error: 'Falta configurar FOOTBALL_DATA_API_TOKEN' },
            { status: 500 },
          )
        }

        const respuesta = await fetch(
          'https://api.football-data.org/v4/competitions/PD/standings',
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': env.FOOTBALL_DATA_API_TOKEN,
              Accept: 'application/json',
            },
          },
        )

        if (!respuesta.ok) {
          return Response.json(
            {
              error: 'No se ha podido consultar la clasificación de LaLiga',
              status: respuesta.status,
            },
            { status: 502 },
          )
        }

        const datos: unknown = await respuesta.json()
        const datosJson = JSON.stringify(datos)

        // Guardar la respuesta completa en D1.
        await env.estadliga_db
          .prepare(
            `INSERT OR REPLACE INTO clasificacion_cache
             (id, datos_json, actualizado_en)
             VALUES (1, ?, ?)`,
          )
          .bind(datosJson, new Date().toISOString())
          .run()

        return new Response(datosJson, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        })
      } catch (error) {
        return Response.json(
          {
            error: 'Error al cargar o guardar la clasificación',
            detalle: error instanceof Error ? error.message : String(error),
          },
          { status: 502 },
        )
      }
    }

     // Consultar los partidos de LaLiga (resultados y calendario).
    // Primero se consultan los datos guardados en D1.
    // GET /api/partidos
    if (url.pathname === '/api/partidos' && request.method === 'GET') {
      try {
        // 1. Comprobar si ya tenemos los partidos guardados.
        const guardados = await env.estadliga_db
          .prepare(
            'SELECT datos_json FROM partidos_cache WHERE id = 1',
          )
          .first<{ datos_json: string }>()

        if (guardados) {
          return new Response(guardados.datos_json, {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'public, max-age=300',
            },
          })
        }

        // 2. Si no hay datos guardados, consultar Football-Data.org.
        if (!env.FOOTBALL_DATA_API_TOKEN) {
          return Response.json(
            { error: 'Falta configurar FOOTBALL_DATA_API_TOKEN' },
            { status: 500 },
          )
        }

        const respuesta = await fetch(
          'https://api.football-data.org/v4/competitions/PD/matches',
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': env.FOOTBALL_DATA_API_TOKEN,
              Accept: 'application/json',
            },
          },
        )

        if (!respuesta.ok) {
          return Response.json(
            {
              error: 'No se han podido consultar los partidos de LaLiga',
              status: respuesta.status,
            },
            { status: 502 },
          )
        }

        const datos = (await respuesta.json()) as {
          matches?: Array<{
            matchday: number | null
            status: string
            utcDate: string
            homeTeam: { id: number }
            awayTeam: { id: number }
            score?: {
              fullTime?: {
                home: number | null
                away: number | null
              }
            }
          }>
        }

        // 3. Preparar los datos que utiliza EstadLiga.
        const partidos = (datos.matches ?? []).map((partido) => ({
          jornada: partido.matchday,
          estado: partido.status,
          fecha: partido.utcDate,
          local: partido.homeTeam.id,
          visitante: partido.awayTeam.id,
          golesLocal: partido.score?.fullTime?.home ?? null,
          golesVisitante: partido.score?.fullTime?.away ?? null,
        }))

        const datosJson = JSON.stringify({ partidos })

        // 4. Guardar la respuesta preparada en D1.
        await env.estadliga_db
          .prepare(
            `INSERT OR REPLACE INTO partidos_cache
             (id, datos_json, actualizado_en)
             VALUES (1, ?, ?)`,
          )
          .bind(datosJson, new Date().toISOString())
          .run()

        // 5. Devolver los partidos al navegador.
        return new Response(datosJson, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        })
      } catch (error) {
        return Response.json(
          {
            error: 'Error al cargar o guardar los partidos',
            detalle: error instanceof Error ? error.message : String(error),
          },
          { status: 502 },
        )
      }
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

    // Consultar las estadísticas de un equipo guardadas en D1.
    // GET /api/equipos/ID/estadisticas?unique_tournament_id=8&season_id=97268
    const rutaEstadisticasEquipo = url.pathname.match(
      /^\/api\/equipos\/(\d+)\/estadisticas$/,
    )

    if (
      rutaEstadisticasEquipo &&
      request.method === 'GET'
    ) {
      const equipoId = Number(rutaEstadisticasEquipo[1])
      const torneoId = Number(
        url.searchParams.get('unique_tournament_id'),
      )
      const temporadaId = Number(
        url.searchParams.get('season_id'),
      )

      if (
        !Number.isInteger(equipoId) ||
        equipoId <= 0 ||
        !Number.isInteger(torneoId) ||
        torneoId <= 0 ||
        !Number.isInteger(temporadaId) ||
        temporadaId <= 0
      ) {
        return Response.json(
          {
            error:
              'Debes indicar un ID de equipo, unique_tournament_id y season_id válidos',
          },
          { status: 400 },
        )
      }

      try {
        const equipo = await env.estadliga_db
          .prepare(
            'SELECT id, nombre, api_id FROM equipos WHERE id = ?',
          )
          .bind(equipoId)
          .first<EquipoBD>()

        if (!equipo) {
          return Response.json(
            { error: 'No existe ese equipo en EstadLiga' },
            { status: 404 },
          )
        }

        const guardadas = await env.estadliga_db
          .prepare(
            `SELECT estadisticas_json, actualizado_en
             FROM estadisticas_equipos
             WHERE equipo_id = ?
               AND unique_tournament_id = ?
               AND season_id = ?`,
          )
          .bind(equipoId, torneoId, temporadaId)
          .first<{
            estadisticas_json: string
            actualizado_en: string
          }>()

        if (!guardadas) {
          return Response.json(
            {
              error:
                'No hay estadísticas guardadas para este equipo y temporada',
              equipo_id: equipoId,
              unique_tournament_id: torneoId,
              season_id: temporadaId,
            },
            { status: 404 },
          )
        }

        return Response.json({
          equipo: {
            id: equipo.id,
            nombre: equipo.nombre,
            sofascore_id: equipo.api_id,
          },
          unique_tournament_id: torneoId,
          season_id: temporadaId,
          origen: 'D1',
          actualizado_en: guardadas.actualizado_en,
          datos: JSON.parse(guardadas.estadisticas_json),
        })
      } catch (error) {
        return Response.json(
          {
            error: 'No se han podido consultar las estadísticas del equipo',
            detalle:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 500 },
        )
      }
    }

    // Importación masiva de estadísticas de equipos por lotes.
    // POST /api/estadisticas-equipos/importar?unique_tournament_id=8&season_id=97268&offset=0&limite=5
    if (
      url.pathname === '/api/estadisticas-equipos/importar' &&
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
              'Parámetros no válidos. Usa unique_tournament_id, season_id, offset >= 0 y limite entre 1 y 10.',
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
            `SELECT id, nombre, api_id
             FROM equipos
             WHERE api_id IS NOT NULL
             ORDER BY id
             LIMIT ? OFFSET ?`,
          )
          .bind(limite, offset)
          .all<EquipoBD>()

        const equipos = resultado.results
        const procesados: Array<{
          id: number
          equipo: string
          resultado: string
          estado?: number
        }> = []

        // Dos peticiones simultáneas para no disparar el consumo de Apify.
        for (let i = 0; i < equipos.length; i += 2) {
          const grupo = equipos.slice(i, i + 2)
          const respuestas = await Promise.all(
            grupo.map(async (equipo) => {
              if (
                equipo.api_id === null ||
                !Number.isInteger(Number(equipo.api_id)) ||
                Number(equipo.api_id) <= 0
              ) {
                return {
                  equipo,
                  ok: false,
                  status: 400,
                  datos: undefined,
                }
              }

              const respuesta = await obtenerEstadisticasEquipo(
                Number(equipo.api_id),
                torneoId,
                temporadaId,
                env.APIFY_TOKEN,
              )

              return { equipo, ...respuesta }
            }),
          )

          for (const respuesta of respuestas) {
            if (!respuesta.ok) {
              procesados.push({
                id: respuesta.equipo.id,
                equipo: respuesta.equipo.nombre,
                resultado: 'error',
                estado: respuesta.status,
              })
              continue
            }

            try {
              await guardarEstadisticasEquipo(
                env,
                respuesta.equipo.id,
                torneoId,
                temporadaId,
                respuesta.datos,
              )

              procesados.push({
                id: respuesta.equipo.id,
                equipo: respuesta.equipo.nombre,
                resultado: 'guardado',
              })
            } catch {
              procesados.push({
                id: respuesta.equipo.id,
                equipo: respuesta.equipo.nombre,
                resultado: 'error_al_guardar',
              })
            }
          }
        }

        const total = await env.estadliga_db
          .prepare(
            'SELECT COUNT(*) AS total FROM equipos WHERE api_id IS NOT NULL',
          )
          .first<{ total: number }>()

        const siguienteOffset = offset + equipos.length

        return Response.json({
          mensaje: 'Lote de estadísticas de equipos procesado',
          torneo_id: torneoId,
          temporada_id: temporadaId,
          offset,
          limite,
          equiposProcesados: equipos.length,
          guardados: procesados.filter(
            (p) => p.resultado === 'guardado',
          ).length,
          errores: procesados.filter(
            (p) => p.resultado !== 'guardado',
          ).length,
          totalEquiposConApiId: total?.total ?? 0,
          siguienteOffset:
            siguienteOffset < (total?.total ?? 0)
              ? siguienteOffset
              : null,
          resultados: procesados,
        })
      } catch (error) {
        return Response.json(
          {
            error: 'No se ha podido procesar el lote de equipos',
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

   async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    if (controller.cron === "0 21 * * 1") {
      ctx.waitUntil(ejecutarActualizacionDiaria(env));
      return;
    }

    if (controller.cron === "0 * * * *") {
      ctx.waitUntil(actualizarCachesFootballData(env));
    }
  },
}
