import { useEffect, useState } from 'react'

import './Inicio.css'

const secciones = [
  {
    nombre: 'Equipos',
    descripcion: 'Consulta los clubes y sus plantillas.',
    icono: '🛡️',
    enlace: '#/equipos',
  },
  {
    nombre: 'Jugadores',
    descripcion: 'Descubre los mejores jugadores y sus estadísticas.',
    icono: '⚽',
    enlace: '#/jugadores',
  },
  {
    nombre: 'Clasificación',
    descripcion: 'Sigue la clasificación de LaLiga.',
    icono: '📊',
    enlace: '#/clasificacion',
  },
  {
    nombre: 'Partidos',
    descripcion: 'Consulta resultados y próximos encuentros.',
    icono: '📅',
    enlace: '#/partidos',
  },
]

type Equipo = { id: number; nombre: string; escudo?: string | null }
type Jugador = { id: number; nombre: string; apellido?: string | null; posicion?: string | null }
type Partido = { id?: number; fecha: string; estado: string; local: string | number; visitante: string | number; golesLocal: number | null; golesVisitante: number | null }
type Clasificacion = { standings?: { table?: { position: number; team: { name: string; id: number }; points: number; playedGames: number }[] }[] }
type Favoritos = { equipos: Equipo[]; jugadores: Jugador[] }
type StatsJugador = { id: number; stats: Record<string, number> }

const normalizar = (s: string) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
const finales = new Set(['FINISHED', 'AWARDED'])
const nombrePartido = (valor: string | number, equipos: Equipo[]) => typeof valor === 'number' ? equipos.find(e => e.id === valor)?.nombre ?? String(valor) : String(valor)
const coincide = (nombre: string, equipo: Equipo) => {
  const a = normalizar(nombre), b = normalizar(equipo.nombre)
  return a === b || (a.length > 5 && b.length > 5 && (a.includes(b) || b.includes(a)))
}
// Mismos escudos locales que utiliza la página Equipos.
const ESCUDOS_EQUIPOS: Record<string, string> = {
  athletic: '/escudos/athletic.png',
  'athletic club': '/escudos/athletic.png',

  'atletico madrid': '/escudos/atlmadrid.png',
  'atletico de madrid': '/escudos/atlmadrid.png',
  'atletico de madrid club de futbol': '/escudos/atlmadrid.png',

  barcelona: '/escudos/barcelona.png',
  'fc barcelona': '/escudos/barcelona.png',

  betis: '/escudos/betis.png',
  'real betis': '/escudos/betis.png',

  celta: '/escudos/celta.png',
  'celta de vigo': '/escudos/celta.png',

  // Deportivo Alavés
  alaves: '/escudos/alaves.png',
  'deportivo alaves': '/escudos/alaves.png',
  'deportivo alaves sad': '/escudos/alaves.png',

  // Elche
  elche: '/escudos/elche.png',
  'elche cf': '/escudos/elche.png',

  // Getafe
  getafe: '/escudos/getafe.png',
  'getafe cf': '/escudos/getafe.png',

  // Levante
  levante: '/escudos/levante.png',
  'levante ud': '/escudos/levante.png',
  'levante union deportiva': '/escudos/levante.png',

  // Málaga
  malaga: '/escudos/malaga.png',
  'malaga cf': '/escudos/malaga.png',

  // CA Osasuna
  osasuna: '/escudos/osasuna.png',
  'ca osasuna': '/escudos/osasuna.png',
  'club atletico osasuna': '/escudos/osasuna.png',

  // Racing de Santander
  racing: '/escudos/racingsantander.png',
  'racing santander': '/escudos/racingsantander.png',
  'racing de santander': '/escudos/racingsantander.png',
  'real racing club': '/escudos/racingsantander.png',
  'real racing club de santander': '/escudos/racingsantander.png',
  'real racing club santander': '/escudos/racingsantander.png',
  'r racing club': '/escudos/racingsantander.png',

  // Deportivo de La Coruña
  deportivo: '/escudos/deportivocoruna.png',
  'deportivo coruna': '/escudos/deportivocoruna.png',
  'deportivo de la coruna': '/escudos/deportivocoruna.png',
  'rc deportivo': '/escudos/deportivocoruna.png',
  'rc deportivo de la coruna': '/escudos/deportivocoruna.png',

  // RCD Espanyol
  espanyol: '/escudos/espanyol.png',
  'rcd espanyol': '/escudos/espanyol.png',
  'espanyol barcelona': '/escudos/espanyol.png',
  'rcd espanyol de barcelona': '/escudos/espanyol.png',

  'rayo vallecano': '/escudos/rayovallecano.png',

  'real madrid': '/escudos/realmadrid.png',

  'real sociedad': '/escudos/realsociedad.png',

  sevilla: '/escudos/sevilla.png',
  'sevilla fc': '/escudos/sevilla.png',

  // Valencia
  valencia: '/escudos/valencia.png',
  'valencia cf': '/escudos/valencia.png',

  // Villarreal
  villarreal: '/escudos/villarreal.png',
  'villarreal cf': '/escudos/villarreal.png',
}
// ID estable de la tabla equipos de D1 -> escudo local.
const ESCUDOS_POR_ID: Record<number, string> = {
  1:'athletic', 2:'atlmadrid', 3:'osasuna', 4:'celta', 5:'alaves',
  6:'elche', 7:'barcelona', 8:'getafe', 9:'levante', 10:'malaga',
  11:'racingsantander', 12:'rayovallecano', 13:'deportivocoruna',
  14:'espanyol', 15:'betis', 16:'realmadrid', 17:'realsociedad',
  18:'sevilla', 19:'valencia', 20:'villarreal',
}
// Football-Data puede devolver denominaciones distintas a las de D1.
// Resolvemos primero por ID de D1 y después por alias del nombre de competición.
const ALIAS_ESCUDOS: Record<string, string> = {
  fcbarcelona: 'barcelona', barcelonafc: 'barcelona',
  clubatleticodemadrid: 'atlmadrid', atleticodemadrid: 'atlmadrid', atleticomadrid: 'atlmadrid',
  athleticclub: 'athletic', athleticclubdebilbao: 'athletic',
  realbetisbalompie: 'betis', realbetis: 'betis',
  rcceltadevigo: 'celta', rccelta: 'celta', celtavigo: 'celta',
  deportivoalaves: 'alaves', deportivoalavessad: 'alaves',
  elchecf: 'elche', getafecf: 'getafe', levanteud: 'levante',
  malagacf: 'malaga', caosasuna: 'osasuna', clubatleticoosasuna: 'osasuna',
  realracingclub: 'racingsantander', realracingclubdesantander: 'racingsantander',
  racingsantander: 'racingsantander', racingdesantander: 'racingsantander',
  rcdeportivo: 'deportivocoruna', rcdeportivolacoruna: 'deportivocoruna',
  rcdeportivodelacoruna: 'deportivocoruna', deportivolacoruna: 'deportivocoruna',
  deportivodelacoruna: 'deportivocoruna', deportivocoruna: 'deportivocoruna',
  rcdespanyol: 'espanyol', rcdespanyoldebarcelona: 'espanyol',
  rayovallecanodemadrid: 'rayovallecano', rayovallecano: 'rayovallecano',
  realmadridcf: 'realmadrid', realsociedaddefutbol: 'realsociedad',
  sevillafc: 'sevilla', valenciacf: 'valencia', villarrealcf: 'villarreal',
}
const escudoEquipo = (nombre: string | number, equipos: Equipo[]) => {
  if (typeof nombre === 'number') {
    const archivo = ESCUDOS_POR_ID[nombre]
    return archivo ? `/escudos/${archivo}.png` : null
  }
  const clave = normalizar(nombre)
  const archivoAlias = ALIAS_ESCUDOS[clave]
  if (archivoAlias) return `/escudos/${archivoAlias}.png`
  const equipo = equipos.find(e => coincide(nombre, e))
  if (equipo && ESCUDOS_POR_ID[equipo.id]) return `/escudos/${ESCUDOS_POR_ID[equipo.id]}.png`
  const claveEspacios = String(nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  if (ESCUDOS_EQUIPOS[claveEspacios]) return ESCUDOS_EQUIPOS[claveEspacios]
  return equipo?.escudo ? (equipo.escudo.startsWith('http') || equipo.escudo.startsWith('/') ? equipo.escudo : `/${equipo.escudo}`) : null
}
// Si una imagen falla, dejamos un símbolo visible en vez de un hueco vacío.
const ocultarEscudoRoto = (evento: import('react').SyntheticEvent<HTMLImageElement>) => {
  const imagen = evento.currentTarget
  imagen.style.display = 'none'
  const padre = imagen.parentElement
  if (padre && !padre.querySelector('.mi-estadliga-escudo-fallback')) {
    const simbolo = document.createElement('span')
    simbolo.className = 'mi-estadliga-escudo-fallback'
    simbolo.textContent = '⚽'
    simbolo.setAttribute('aria-label', 'Escudo no disponible')
    padre.insertBefore(simbolo, imagen)
  }
}
const fechaPartido = (fecha: string) => {
  const ms = Date.parse(fecha)
  return Number.isFinite(ms) ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(ms) : 'Por confirmar'
}

function Inicio() {
  const [miEquipo, setMiEquipo] = useState<Equipo | null>(null)
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState<number | null>(null)
  const [favoritos, setFavoritos] = useState<Favoritos>({ equipos: [], jugadores: [] })
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [clasificacion, setClasificacion] = useState<Clasificacion | null>(null)
  const [estadisticas, setEstadisticas] = useState<StatsJugador[]>([])
  const [sesion, setSesion] = useState(false)
  const [cargandoPersonalizacion, setCargandoPersonalizacion] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    const opciones = { signal: controller.signal }
    async function json<T>(url: string, privado = false): Promise<T | null> {
      try {
        const r = await fetch(url, { ...opciones, ...(privado ? { credentials: 'same-origin' as const, cache: 'no-store' as const } : {}) })
        return r.ok ? await r.json() as T : null
      } catch { return null }
    }
    async function cargar() {
      const perfil = await json<{ perfil?: { equipo_favorito_id?: number | null } }>('/api/perfil', true)
      if (controller.signal.aborted) return
      if (!perfil) { setCargandoPersonalizacion(false); return }
      setSesion(true)
      const [lista, favoritosDatos, calendario, tabla, stats] = await Promise.all([
        json<Equipo[]>('/api/equipos'),
        json<Favoritos>('/api/favoritos', true),
        json<{ partidos?: Partido[] }>('/api/partidos'),
        json<Clasificacion>('/api/clasificacion'),
        json<{ jugadores?: StatsJugador[] }>('/api/jugadores/estadisticas?unique_tournament_id=8&season_id=97268'),
      ])
      if (controller.signal.aborted) return
      const listaEquipos = Array.isArray(lista) ? lista : []
      setEquipos(listaEquipos)
      const principal = listaEquipos.find(e => e.id === perfil.perfil?.equipo_favorito_id) ?? null
      setMiEquipo(principal)
      setEquipoSeleccionadoId(principal?.id ?? favoritosDatos?.equipos?.[0]?.id ?? null)
      if (favoritosDatos) setFavoritos({ equipos: favoritosDatos.equipos ?? [], jugadores: favoritosDatos.jugadores ?? [] })
      setPartidos(calendario?.partidos ?? [])
      setClasificacion(tabla)
      setEstadisticas(stats?.jugadores ?? [])
      setCargandoPersonalizacion(false)
    }
    void cargar()
    return () => controller.abort()
  }, [])
  const equiposSeguidos = [...favoritos.equipos]
  if (miEquipo && !equiposSeguidos.some(e => e.id === miEquipo.id)) equiposSeguidos.unshift(miEquipo)
  const equipoActivo = equiposSeguidos.find(e => e.id === equipoSeleccionadoId) ?? miEquipo ?? equiposSeguidos[0] ?? null
  const partidoDe = (p: Partido, equipo: Equipo) => coincide(nombrePartido(p.local, equipos), equipo) || coincide(nombrePartido(p.visitante, equipos), equipo) || p.local === equipo.id || p.visitante === equipo.id
  const ordenados = [...partidos].filter(p => Number.isFinite(Date.parse(p.fecha))).sort((a,b) => Date.parse(a.fecha)-Date.parse(b.fecha))
  const proximos = ordenados.filter(p => !finales.has(p.estado) && Date.parse(p.fecha) >= Date.now() - 3*60*60*1000 && equiposSeguidos.some(e => partidoDe(p,e))).slice(0, 5)
  const ultimos = equipoActivo ? ordenados.filter(p => finales.has(p.estado) && partidoDe(p,equipoActivo) && Date.parse(p.fecha) <= Date.now()).reverse().slice(0,5) : []
  const fila = equipoActivo ? clasificacion?.standings?.flatMap(g => g.table ?? []).find(f => f.team.id === equipoActivo.id || coincide(f.team.name,equipoActivo)) : null
  const jugadoresSeguidos = favoritos.jugadores.slice(0,5)
  const proximoPrincipal = equipoActivo ? ordenados.find(p => !finales.has(p.estado) && Date.parse(p.fecha) >= Date.now() - 3*60*60*1000 && partidoDe(p, equipoActivo)) : undefined
  const forma = ultimos.map(p => {
    if (p.golesLocal == null || p.golesVisitante == null || !equipoActivo) return '?'
    const local = coincide(nombrePartido(p.local, equipos), equipoActivo)
    const propios = local ? p.golesLocal : p.golesVisitante
    const rival = local ? p.golesVisitante : p.golesLocal
    return propios > rival ? 'V' : propios < rival ? 'D' : 'E'
  }).reverse()
  const puntosForma = forma.reduce((total, resultado) => total + (resultado === 'V' ? 3 : resultado === 'E' ? 1 : 0), 0)
  return (
    <>
      <section className="presentacion">
        <div className="presentacion-contenido">
          <span className="etiqueta">TU FÚTBOL, EN DATOS</span>

          <h1>
            Vive LaLiga.
            <br />
            <span>Entiende el juego.</span>
          </h1>

          <p>
            Estadísticas, equipos, jugadores y resultados de Primera División
            en un solo lugar.
          </p>

          <a className="boton-principal" href="#/equipos">
            Explorar LaLiga <span>→</span>
          </a>
        </div>

        <div className="presentacion-visual" aria-hidden="true">
          <div className="circulo circulo-externo" />
          <div className="circulo circulo-interior" />
          <div className="balon">⚽</div>

          <div className="dato-flotante">
            <span>ESTADÍSTICAS</span>
            <strong>Todo el fútbol</strong>
            <small>En un solo lugar</small>
          </div>
        </div>
      </section>

      {sesion && <section className="seccion-contenido mi-estadliga" aria-label="Inicio personalizado">
        <div className="mi-estadliga-heading">
          <div><span className="subtitulo">● TU ESTADLIGA</span><h2>Tu fútbol, a tu manera.</h2><p>Tu equipo, tus partidos y tus jugadores en un solo lugar.</p></div>
          <a className="mi-estadliga-config" href="#/mi-cuenta">⚙ Personalizar mi cuenta →</a>
        </div>
        {cargandoPersonalizacion ? <p role="status">Cargando tu información...</p> : <div className="mi-estadliga-dashboard">
          {equiposSeguidos.length > 0 && <div className="mi-estadliga-selector" aria-label="Selecciona el equipo que quieres consultar">
            <div className="mi-estadliga-selector-titulo"><strong>Mis equipos favoritos</strong><span>Selecciona uno para ver sus datos</span></div>
            <div className="mi-estadliga-selector-lista">
              {equiposSeguidos.map(e => <button type="button" key={e.id} className={`mi-estadliga-selector-equipo ${equipoActivo?.id === e.id ? 'activo' : ''}`} aria-pressed={equipoActivo?.id === e.id} onClick={() => setEquipoSeleccionadoId(e.id)}>
                {escudoEquipo(e.id,equipos) && <img src={escudoEquipo(e.id,equipos)!} alt="" onError={ocultarEscudoRoto} />}
                <span>{e.nombre}</span>{miEquipo?.id === e.id && <small>Principal</small>}
              </button>)}
            </div>
          </div>}
          <div className="mi-estadliga-hero">
            <div className="mi-estadliga-hero-content">
              <span className="mi-estadliga-eyebrow">MI EQUIPO PRINCIPAL · LALIGA 2026/27</span>
              {equipoActivo ? <>
                <div className="mi-estadliga-hero-team">
                  {escudoEquipo(equipoActivo.id, equipos) && <img src={escudoEquipo(equipoActivo.id, equipos)!} alt={`Escudo de ${equipoActivo.nombre}`} onError={ocultarEscudoRoto} />}
                  <div><h3>{equipoActivo.nombre}</h3><span>Tu pasión, todos sus números.</span></div>
                </div>
                <div className="mi-estadliga-kpis">
                  <div><strong>{fila?.position ? `${fila.position}º` : '—'}</strong><span>Posición</span></div>
                  <div><strong>{fila?.points ?? '—'}</strong><span>Puntos</span></div>
                  <div><strong>{fila?.playedGames ?? '—'}</strong><span>Partidos</span></div>
                </div>
                <a className="mi-estadliga-hero-link" href={`#/equipos/${equipoActivo.id}`}>Explorar mi equipo <span>↗</span></a>
              </> : <><h3>Elige tu equipo</h3><p>Personaliza tu inicio desde Mi cuenta.</p><a className="mi-estadliga-hero-link" href="#/mi-cuenta">Elegir equipo ↗</a></>}
            </div>
            <div className="mi-estadliga-hero-decoration" aria-hidden="true">⚽</div>
          </div>
          <div className="mi-estadliga-section-heading"><div><span className="mi-estadliga-rotulo">AGENDA FUTBOLÍSTICA</span><h3>El próximo encuentro</h3></div><a href="#/partidos">Calendario completo ↗</a></div>
          {proximoPrincipal ? <div className="mi-estadliga-match-feature">
            <div className="mi-estadliga-match-meta"><span>PRÓXIMO PARTIDO</span><strong>{fechaPartido(proximoPrincipal.fecha)}</strong></div>
            <div className="mi-estadliga-match-versus">
              <div className="mi-estadliga-match-club">{escudoEquipo(proximoPrincipal.local,equipos) && <img src={escudoEquipo(proximoPrincipal.local,equipos)!} alt="" onError={ocultarEscudoRoto} />}<strong>{nombrePartido(proximoPrincipal.local,equipos)}</strong></div>
              <div className="mi-estadliga-vs"><strong>VS</strong><small>LaLiga</small></div>
              <div className="mi-estadliga-match-club">{escudoEquipo(proximoPrincipal.visitante,equipos) && <img src={escudoEquipo(proximoPrincipal.visitante,equipos)!} alt="" onError={ocultarEscudoRoto} />}<strong>{nombrePartido(proximoPrincipal.visitante,equipos)}</strong></div>
            </div>
          </div> : <div className="mi-estadliga-empty">{equipoActivo ? 'No hay próximos encuentros disponibles.' : 'Elige un equipo principal para destacar su próximo encuentro.'}</div>}
          <div className="mi-estadliga-section-heading"><div><span className="mi-estadliga-rotulo">TUS EQUIPOS</span><h3>Próximos partidos</h3></div></div>
          <div className="mi-estadliga-fixtures">
            {proximos.length ? proximos.map((p,i) => <div className="mi-estadliga-fixture" key={`${p.fecha}-${i}`}>
              <span className="mi-estadliga-fixture-date">{fechaPartido(p.fecha)}</span>
              <div className="mi-estadliga-fixture-teams">
                {escudoEquipo(p.local,equipos) && <img src={escudoEquipo(p.local,equipos)!} alt="" onError={ocultarEscudoRoto} />}
                <strong>{nombrePartido(p.local,equipos)}</strong><span className="mi-estadliga-fixture-vs">vs</span><strong>{nombrePartido(p.visitante,equipos)}</strong>
                {escudoEquipo(p.visitante,equipos) && <img src={escudoEquipo(p.visitante,equipos)!} alt="" onError={ocultarEscudoRoto} />}
              </div>
            </div>) : <div className="mi-estadliga-empty">No hay próximos partidos de tus equipos favoritos.</div>}
          </div>
          <div className="mi-estadliga-two-cols">
            <div className="mi-estadliga-card"><div className="mi-estadliga-card-head"><div><span className="mi-estadliga-rotulo">RENDIMIENTO</span><h3>Últimos resultados</h3></div><span className="mi-estadliga-card-symbol">↗</span></div>
              {equipoActivo && ultimos.length > 0 && <div className="mi-estadliga-form"><div><strong>{puntosForma}</strong><span>puntos en los últimos {forma.length} partidos</span></div><div className="mi-estadliga-form-badges">{forma.map((f,i)=><span key={i} className={`mi-estadliga-form-${f}`}>{f}</span>)}</div></div>}
              <div className="mi-estadliga-results">{ultimos.length ? ultimos.map((p,i) => <div className="mi-estadliga-result" key={`${p.fecha}-${i}`}><span>{nombrePartido(p.local,equipos)}</span><strong>{p.golesLocal ?? '–'} : {p.golesVisitante ?? '–'}</strong><span>{nombrePartido(p.visitante,equipos)}</span></div>) : <p>{equipoActivo ? 'No hay resultados disponibles.' : 'Elige tu equipo principal.'}</p>}</div>
              <a href="#/partidos">Ver todos los resultados →</a>
            </div>
            <div className="mi-estadliga-card"><div className="mi-estadliga-card-head"><div><span className="mi-estadliga-rotulo">TUS ESTRELLAS</span><h3>Jugadores favoritos</h3></div><span className="mi-estadliga-card-symbol">★</span></div>
              <div className="mi-estadliga-players">{jugadoresSeguidos.length ? jugadoresSeguidos.map(j => { const s = estadisticas.find(e => e.id === j.id)?.stats; return <a className="mi-estadliga-player" href={`#/jugadores/${j.id}`} key={j.id}><div className="mi-estadliga-player-avatar"><img src={`/api/jugadores/${j.id}/imagen`} alt={`Foto de ${j.nombre} ${j.apellido ?? ''}`} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('sin-foto') }} /><span aria-hidden="true">⚽</span></div><div className="mi-estadliga-player-name"><strong>{j.nombre} {j.apellido ?? ''}</strong><small>{j.posicion ?? 'Jugador'}</small></div><div className="mi-estadliga-player-stats"><strong>{s?.goals ?? '—'}</strong><small>Goles</small></div><div className="mi-estadliga-player-stats"><strong>{s?.goalAssist ?? s?.assists ?? '—'}</strong><small>Asist.</small></div><span className="mi-estadliga-player-arrow">↗</span></a> }) : <p>Añade jugadores a favoritos para seguir sus estadísticas.</p>}</div>
              <a href="#/favoritos">Gestionar mis favoritos →</a>
            </div>
          </div>
        </div>}
      </section>}
      <section className="seccion-contenido">
        <div className="titulo-seccion">
          <div>
            <span className="subtitulo">DESCUBRE ESTADLIGA</span>
            <h2>Todo lo que necesitas</h2>
          </div>

          <p>Explora la competición desde todos los ángulos.</p>
        </div>

        <div className="rejilla-secciones">
          {secciones.map((seccion) => (
            <a
              className="tarjeta"
              href={seccion.enlace}
              key={seccion.nombre}
            >
              <span className="tarjeta-icono">{seccion.icono}</span>
              <h3>{seccion.nombre}</h3>
              <p>{seccion.descripcion}</p>
              <span className="tarjeta-enlace">Explorar →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="bloque-informativo">
        <div>
          <span className="subtitulo">MÁS QUE RESULTADOS</span>
          <h2>Los datos también cuentan historias.</h2>
          <p>
            Sigue la evolución de los equipos y descubre todos los detalles
            de la competición.
          </p>
        </div>

        <a href="#/jugadores" className="boton-secundario">
          Ver estadísticas →
        </a>
      </section>
    </>
  )
}

export default Inicio
