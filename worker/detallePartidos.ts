/** Detalle de partidos con caché D1 y presupuesto compartido de API-Football. */
interface EntornoDetalle { estadliga_db: D1Database; API_FOOTBALL_KEY: string }
type PartidoCalendario = { id?: number; fecha: string; local: string | number; visitante: string | number }
type Fixture = { fixture: { id: number; date: string; status?: { short?: string } }; league: { id: number }; teams: { home: { name: string }; away: { name: string } }; [key: string]: unknown }
const NORMALIZAR = (v: string | number) => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
const alias: Record<string,string> = {sevillafc:'sevilla',realbetisbalompie:'betis',realbetis:'betis',atleticodemadrid:'atleticomadrid',clubatleticodemadrid:'atleticomadrid',athleticclub:'athleticbilbao',futbolclubbarcelona:'barcelona',fcbarcelona:'barcelona',realmadridcf:'realmadrid',deportivoalaves:'alaves',realracingclub:'racingsantander',realracingclubdesantander:'racingsantander',racingdesantander:'racingsantander',rcdeportivo:'deportivolacoruna',rcdeportivodelacoruna:'deportivolacoruna',deportivodelacoruna:'deportivolacoruna',rcdespanyol:'espanyol',rcdespanyoldebarcelona:'espanyol',rcceltadevigo:'celtavigo',rcelta:'celtavigo'}
function equipo(nombre: string | number) { const n = NORMALIZAR(nombre); return alias[n] ?? n }
function coincide(a: string | number,b: string | number) { const x=equipo(a),y=equipo(b); return x===y || (x.length>5 && y.length>5 && (x.includes(y)||y.includes(x))) }
async function reservar(env: EntornoDetalle) {
  const ahora = new Date().toISOString()
  const r = await env.estadliga_db.prepare(`INSERT INTO api_football_control (fecha,peticiones,actualizado_en) VALUES (?,1,?) ON CONFLICT(fecha) DO UPDATE SET peticiones=peticiones+1,actualizado_en=excluded.actualizado_en WHERE peticiones < 85 RETURNING peticiones`).bind(ahora.slice(0,10),ahora).first()
  return Boolean(r)
}
async function api(env: EntornoDetalle, path: string): Promise<unknown[]> {
  if (!env.API_FOOTBALL_KEY) throw new Error('API-Football no configurada')
  if (!(await reservar(env))) throw new Error('Límite diario de consultas alcanzado')
  const respuesta = await fetch('https://v3.football.api-sports.io'+path,{headers:{'x-apisports-key':env.API_FOOTBALL_KEY}})
  if (!respuesta.ok) throw new Error(`API-Football HTTP ${respuesta.status}`)
  const json = await respuesta.json() as { errors?: Record<string,unknown>; response?: unknown[] }
  if (json.errors && Object.keys(json.errors).length) throw new Error('API-Football no ha permitido esta consulta')
  return json.response ?? []
}
async function leer(env: EntornoDetalle, id: number) {
  const fila = await env.estadliga_db.prepare('SELECT datos_json,actualizado_en FROM api_football_detalles WHERE partido_id=?').bind(id).first<{datos_json:string;actualizado_en:string}>()
  return fila ? { datos: JSON.parse(fila.datos_json) as Record<string,unknown>, actualizado: Date.parse(fila.actualizado_en) } : null
}
async function guardar(env: EntornoDetalle,id:number,datos:Record<string,unknown>) {
  await env.estadliga_db.prepare('INSERT INTO api_football_detalles (partido_id,datos_json,actualizado_en) VALUES (?,?,?) ON CONFLICT(partido_id) DO UPDATE SET datos_json=excluded.datos_json,actualizado_en=excluded.actualizado_en').bind(id,JSON.stringify(datos),new Date().toISOString()).run()
}
export async function servirDetallePartido(request:Request,env:EntornoDetalle,id:number):Promise<Response> {
  if(request.method!=='GET') return Response.json({error:'Método no permitido'},{status:405})
  try {
    const fila = await env.estadliga_db.prepare('SELECT datos_json FROM partidos_cache WHERE id=1').first<{datos_json:string}>()
    const partidos = fila ? (JSON.parse(fila.datos_json) as {partidos?:PartidoCalendario[]}).partidos ?? [] : []
    const partido = partidos.find(p=>p.id===id)
    if (!partido) return Response.json({error:'Partido no encontrado en el calendario'},{status:404})
    const existente=await leer(env,id)
    const fecha=Date.parse(partido.fecha)
    const terminado=Number.isFinite(fecha) && Date.now()>fecha+4*60*60_000
    const ttl=terminado?7*24*60*60_000:15*60_000
    if(existente && Date.now()-existente.actualizado<ttl) return Response.json({ok:true,partido,detalle:existente.datos,cache:true})
    // Si la consulta externa falla, conservar los datos anteriores.
    try {
      let fixtureId = typeof existente?.datos.fixtureId==='number'?existente.datos.fixtureId:undefined
      if(!fixtureId) {
        const dia = new Date(fecha).toISOString().slice(0,10)
        const lista=(await api(env,`/fixtures?league=140&season=${new Date(fecha).getUTCFullYear()-(new Date(fecha).getUTCMonth()<6?1:0)}&date=${dia}`)) as Fixture[]
        const encontrado=lista.find(f=>Math.abs(Date.parse(f.fixture.date)-fecha)<4*60*60_000 && coincide(partido.local,f.teams.home.name)&&coincide(partido.visitante,f.teams.away.name))
        fixtureId=encontrado?.fixture.id
        if(!fixtureId) return Response.json({ok:true,partido,detalle:existente?.datos??null,aviso:'No se ha encontrado este encuentro en API-Football'})
      }
      const [ficha] = await api(env,`/fixtures?id=${fixtureId}`)
      const detalle:Record<string,unknown>={fixtureId,ficha:ficha??null,estadisticas:[],alineaciones:[],jugadores:[]}
      // Reutilizar alineaciones y estadísticas ya guardadas si no se han actualizado.
      if(existente?.datos.fixtureId===fixtureId) {
        detalle.estadisticas=existente.datos.estadisticas??[]
        detalle.alineaciones=existente.datos.alineaciones??[]
        detalle.jugadores=existente.datos.jugadores??[]
      }
      // Una consulta por categoría, solo cuando todavía no está en caché.
      for(const [campo,ruta] of [['alineaciones','lineups'],['estadisticas','statistics'],['jugadores','players']] as const) {
        // Estadísticas y jugadores no se solicitan hasta que comience el encuentro.
        if (Date.now() < fecha && campo !== 'alineaciones') continue
        const anterior=detalle[campo]
        if(Array.isArray(anterior)&&anterior.length>0) continue
        try { detalle[campo]=await api(env,`/fixtures/${ruta}?fixture=${fixtureId}`) } catch(e) { console.warn('Detalle parcial',campo,e) }
      }
      await guardar(env,id,detalle)
      return Response.json({ok:true,partido,detalle,cache:false},{headers:{'Cache-Control':'public, max-age=60'}})
    } catch(e) {
      if(existente) return Response.json({ok:true,partido,detalle:existente.datos,cache:true,aviso:'Datos guardados: actualización no disponible'})
      return Response.json({ok:true,partido,detalle:null,aviso:e instanceof Error?e.message:'Detalle no disponible'})
    }
  } catch(e) {
    console.error('Error detalle partido',e)
    return Response.json({error:'No se pudo consultar el detalle'},{status:500})
  }
}
