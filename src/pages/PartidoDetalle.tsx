import { useEffect, useState } from 'react'
import './PartidoDetalle.css'

type Evento = { time?: { elapsed?: number; extra?: number }; team?: { name?: string }; player?: { name?: string }; assist?: { name?: string }; type?: string; detail?: string }
type Estadistica = { type: string; value: string | number | null }
type EquipoStats = { team?: { name?: string }; statistics?: Estadistica[] }
type Jugador = { player?: { id?: number; name?: string; number?: number; pos?: string }; statistics?: Array<Record<string, unknown>> }
type Alineacion = { team?: { name?: string }; formation?: string; coach?: { name?: string }; startXI?: Jugador[]; substitutes?: Jugador[] }
type Ficha = { fixture?: { date?: string; referee?: string; venue?: { name?: string; city?: string }; status?: { short?: string; elapsed?: number } }; teams?: { home?: { name?: string; logo?: string }; away?: { name?: string; logo?: string } }; goals?: { home?: number|null; away?: number|null }; score?: { halftime?: {home?:number|null;away?:number|null} }; events?: Evento[] }
type Detalle = { fixtureId?: number; ficha?: Ficha; estadisticas?: EquipoStats[]; alineaciones?: Alineacion[]; jugadores?: Array<{ team?: { name?: string }; players?: Jugador[] }> }
type Partido = { id?: number; local: string | number; visitante: string | number; fecha: string; jornada: number|null; estado: string; golesLocal:number|null; golesVisitante:number|null }
type Respuesta = { ok?: boolean; partido?: Partido; detalle?: Detalle|null; aviso?: string; error?: string }
const nombres: Record<string,string> = { 'Ball Possession':'Posesión','Total Shots':'Tiros totales','Shots on Goal':'Tiros a puerta','Shots off Goal':'Tiros fuera','Blocked Shots':'Tiros bloqueados','Corner Kicks':'Córners','Offsides':'Fueras de juego','Fouls':'Faltas','Yellow Cards':'Tarjetas amarillas','Red Cards':'Tarjetas rojas','Total passes':'Pases totales','Passes accurate':'Pases precisos','Passes %':'Precisión de pase','Goalkeeper Saves':'Paradas','Expected Goals':'Goles esperados' }
function eventoNombre(e:Evento) { if(e.type==='Goal')return e.detail?.includes('Own')?'Autogol':'⚽ Gol';if(e.type==='Card')return e.detail?.toLowerCase().includes('red')?'🟥 Tarjeta roja':'🟨 Tarjeta amarilla';if(e.type==='subst')return '🔄 Sustitución';if(e.type==='Var')return '📺 VAR';return e.detail||e.type||'Evento' }
function valor(v:unknown) {return v===null||v===undefined||v===''?'—':String(v)}
function ListaJugadores({jugadores}: {jugadores?:Jugador[]}) {return <ul className="detalle-jugadores-lista">{(jugadores??[]).map((j,i)=><li key={j.player?.id??i}><span>{j.player?.number??'—'}</span>{j.player?.name??'Sin identificar'} <small>{j.player?.pos??''}</small></li>)}</ul>}
export default function PartidoDetalle({id}:{id:number}) {
  const [datos,setDatos]=useState<Respuesta|null>(null)
  const [cargando,setCargando]=useState(true)
  const [pestana,setPestana]=useState<'resumen'|'estadisticas'|'alineaciones'|'jugadores'>('resumen')
  useEffect(()=>{
    let activo=true
    async function cargar(){try{const r=await fetch(`/api/partidos/${id}/informacion`,{cache:'no-store'});const json=await r.json() as Respuesta;if(activo)setDatos(json)}catch{if(activo)setDatos({error:'No se pudo cargar el partido'})}finally{if(activo)setCargando(false)}}
    void cargar();const timer=window.setInterval(()=>{void cargar()},60_000)
    return()=>{activo=false;window.clearInterval(timer)}
  },[id])
  const p=datos?.partido
  const d=datos?.detalle
  const f=d?.ficha
  const eventos=f?.events??[]
  const local=f?.teams?.home?.name??String(p?.local??'Local')
  const visitante=f?.teams?.away?.name??String(p?.visitante??'Visitante')
  const localGoles=f?.goals?.home??p?.golesLocal
  const visitanteGoles=f?.goals?.away??p?.golesVisitante
  const fecha=p?.fecha?new Date(p.fecha):null
  const jugLocal=d?.jugadores?.[0]?.players??[]
  const jugVisitante=d?.jugadores?.[1]?.players??[]
  return <section className="seccion-contenido pagina-detalle-partido">
    <a className="detalle-volver" href="#/partidos">← Volver al calendario</a>
    {cargando&&!datos&&<p role="status">Cargando información del partido…</p>}
    {datos?.error&&<p role="alert">{datos.error}</p>}
    {p&&<>
      <header className="detalle-partido-cabecera">
        <p className="detalle-partido-subtitulo">LaLiga 2026/27 · Jornada {p.jornada??'—'}</p>
        <div className="detalle-partido-marcador">
          <div className="detalle-partido-equipo">{f?.teams?.home?.logo&&<img src={f.teams.home.logo} alt=""/>}<strong>{local}</strong></div>
          <div className="detalle-partido-resultado"><strong>{valor(localGoles)} - {valor(visitanteGoles)}</strong><span>{f?.fixture?.status?.elapsed?`${f.fixture.status.elapsed}′ · `:''}{f?.fixture?.status?.short??p.estado}</span></div>
          <div className="detalle-partido-equipo">{f?.teams?.away?.logo&&<img src={f.teams.away.logo} alt=""/>}<strong>{visitante}</strong></div>
        </div>
        <p className="detalle-partido-subtitulo">{fecha&&!Number.isNaN(fecha.getTime())?fecha.toLocaleString('es-ES',{dateStyle:'full',timeStyle:'short'}):'Fecha por confirmar'}{f?.fixture?.venue?.name?` · ${f.fixture.venue.name}`:''}{f?.fixture?.referee?` · Árbitro: ${f.fixture.referee}`:''}</p>
      </header>
      {datos?.aviso&&<p className="detalle-partido-aviso" role="status">{datos.aviso}</p>}
      <nav className="detalle-partido-pestanas" aria-label="Información del partido">
        {([['resumen','Resumen'],['estadisticas','Estadísticas'],['alineaciones','Alineaciones'],['jugadores','Jugadores']] as const).map(([k,t])=><button type="button" key={k} aria-pressed={pestana===k} onClick={()=>setPestana(k)}>{t}</button>)}
      </nav>
      <div className="detalle-partido-panel">
        {pestana==='resumen'&&<><h2>Cronología del encuentro</h2>{eventos.length? <ol className="detalle-eventos">{[...eventos].sort((a,b)=>(a.time?.elapsed??0)-(b.time?.elapsed??0)).map((e,i)=><li key={i}><time>{e.time?.elapsed??'—'}′{e.time?.extra?`+${e.time.extra}`:''}</time><div><strong>{eventoNombre(e)}</strong><p>{e.player?.name??'Jugador sin identificar'}{e.assist?.name?` · ${e.type==='subst'?'Sale':'Asistencia'}: ${e.assist.name}`:''}</p><small>{e.team?.name??''}</small></div></li>)}</ol>:<p>La cronología no está disponible para este encuentro.</p>}</>}
        {pestana==='estadisticas'&&<><h2>Estadísticas de los equipos</h2>{(d?.estadisticas?.length??0)>0?<div className="detalle-estadisticas">{Array.from(new Set(d?.estadisticas?.flatMap(t=>(t.statistics??[]).map(s=>s.type))??[])).map(tipo=><div className="detalle-estadistica" key={tipo}><strong>{valor(d?.estadisticas?.[0]?.statistics?.find(s=>s.type===tipo)?.value)}</strong><span>{nombres[tipo]??tipo}</span><strong>{valor(d?.estadisticas?.[1]?.statistics?.find(s=>s.type===tipo)?.value)}</strong></div>)}</div>:<p>No hay estadísticas de equipo disponibles.</p>}</>}
        {pestana==='alineaciones'&&<><h2>Alineaciones y banquillos</h2>{d?.alineaciones?.length?<div className="detalle-columnas">{d.alineaciones.map((a,i)=><section key={i}><h3>{a.team?.name??`Equipo ${i+1}`} · {a.formation??'Formación no disponible'}</h3><p>Entrenador: {a.coach?.name??'No disponible'}</p><h4>Once inicial</h4><ListaJugadores jugadores={a.startXI}/><h4>Suplentes</h4><ListaJugadores jugadores={a.substitutes}/></section>)}</div>:<p>Las alineaciones no están disponibles para este encuentro.</p>}</>}
        {pestana==='jugadores'&&<><h2>Estadísticas individuales</h2>{jugLocal.length||jugVisitante.length?<div className="detalle-columnas">{[jugLocal,jugVisitante].map((grupo,i)=><section key={i}><h3>{i===0?local:visitante}</h3><div className="detalle-tabla-scroll"><table><thead><tr><th>Jugador</th><th>Min.</th><th>Goles</th><th>Asist.</th><th>Nota</th></tr></thead><tbody>{grupo.map((j,k)=>{const s=j.statistics?.[0] as {games?:{minutes?:number;rating?:string};goals?:{total?:number;assists?:number}}|undefined;return <tr key={j.player?.id??k}><td>{j.player?.name??'—'}</td><td>{valor(s?.games?.minutes)}</td><td>{valor(s?.goals?.total)}</td><td>{valor(s?.goals?.assists)}</td><td>{valor(s?.games?.rating)}</td></tr>})}</tbody></table></div></section>)}</div>:<p>No hay estadísticas individuales disponibles.</p>}</>}
      </div>
      <p className="detalle-partido-fuente">Datos: Football-Data.org y API-Football. La disponibilidad depende de la cobertura y de la cuota gratuita. La página comprueba las actualizaciones cada minuto.</p>
    </>}
  </section>
}
