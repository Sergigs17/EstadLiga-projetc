import { aplicarTema, temaValido } from '../utils/apariencia'
import { useEffect, useState, type FormEvent } from 'react'
import './MiCuenta.css'

interface Usuario { id: number; nombre: string; email: string; rol: string; email_verificado: boolean }
interface Perfil { alias: string; nombre_visible: string; biografia: string; equipo_favorito_id: number | null; avatar: string; tema: string; perfil_publico: number; completado: number }
interface Equipo { id: number; nombre: string }
const avatares = [{ id: 'balon', icono: '⚽' }, { id: 'campo', icono: '🏟️' }, { id: 'trofeo', icono: '🏆' }, { id: 'escudo', icono: '🛡️' }, { id: 'estrella', icono: '⭐' }]
const aliasInicial = (usuario: Usuario) => `usuario_${usuario.id}`

export default function MiCuenta() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordRepetida, setPasswordRepetida] = useState('')
  const [guardandoPassword, setGuardandoPassword] = useState(false)

  useEffect(() => {
    let activo = true
    async function cargar() {
      try {
        const respuesta = await fetch('/api/perfil', { credentials: 'same-origin', cache: 'no-store' })
        if (respuesta.status === 401) { window.location.hash = '#/login'; return }
        if (!respuesta.ok) throw new Error('No se ha podido cargar el perfil. Comprueba que la migración SQL está aplicada.')
        const datos: { usuario: Usuario; perfil: Perfil | null } = await respuesta.json()
        if (!activo) return
        setUsuario(datos.usuario)
        setNuevo(!datos.perfil?.completado)
        setPerfil(datos.perfil ?? {
          alias: aliasInicial(datos.usuario), nombre_visible: datos.usuario.nombre || '', biografia: '',
          equipo_favorito_id: null, avatar: 'balon', tema: 'sistema', perfil_publico: 0, completado: 0,
        })
        const respuestaEquipos = await fetch('/api/equipos')
        if (respuestaEquipos.ok) {
          const lista: unknown = await respuestaEquipos.json()
          if (activo && Array.isArray(lista)) setEquipos(lista as Equipo[])
        }
      } catch (e) { if (activo) setError(e instanceof Error ? e.message : 'No se ha podido cargar la cuenta') }
      finally { if (activo) setCargando(false) }
    }
    void cargar()
    return () => { activo = false }
  }, [])

  function cambiar<K extends keyof Perfil>(campo: K, valor: Perfil[K]) {
    setPerfil(actual => actual ? { ...actual, [campo]: valor } : actual)
    setExito('')
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!perfil || guardando) return
    setError(''); setExito(''); setGuardando(true)
    try {
      const respuesta = await fetch('/api/perfil', {
        method: 'PUT', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: perfil.alias, nombre_visible: perfil.nombre_visible,
          biografia: perfil.biografia, equipo_favorito_id: perfil.equipo_favorito_id,
          avatar: perfil.avatar, tema: perfil.tema, perfil_publico: Boolean(perfil.perfil_publico) }),
      })
      const datos: { error?: string } = await respuesta.json()
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo guardar')
      if (temaValido(perfil.tema)) aplicarTema(perfil.tema)
      setNuevo(false)
      setExito('Tus cambios se han guardado correctamente.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al guardar') }
    finally { setGuardando(false) }
  }

  async function guardarPassword(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (passwordNueva !== passwordRepetida) { setError('Las contraseñas nuevas no coinciden'); return }
    setError(''); setExito(''); setGuardandoPassword(true)
    try {
      const respuesta = await fetch('/api/auth/password', { method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/json'}, body: JSON.stringify({password_actual:passwordActual,password:passwordNueva}) })
      const datos: {error?:string;mensaje?:string} = await respuesta.json()
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo cambiar la contraseña')
      setPasswordActual('');setPasswordNueva('');setPasswordRepetida('');setExito(datos.mensaje || 'Contraseña guardada')
    } catch(e) {setError(e instanceof Error ? e.message : 'Error al cambiar contraseña')}
    finally {setGuardandoPassword(false)}
  }

  const equipoFavorito = equipos.find(e => e.id === perfil?.equipo_favorito_id)

  return <section className="seccion-contenido mi-cuenta">
    <header className="perfil-intro">
      <span className="perfil-etiqueta">ESTADLIGA · ZONA PERSONAL</span>
      <h1>{nuevo ? '¡Bienvenido a EstadLiga!' : 'Mi cuenta'}</h1>
      <p>{nuevo ? 'Completa tu perfil para personalizar tu experiencia. Podrás cambiar estos datos cuando quieras.' : 'Personaliza tu perfil, elige tu equipo favorito y gestiona tus preferencias.'}</p>
    </header>

    {cargando && <p className="perfil-estado">Cargando tu cuenta...</p>}
    {error && <p role="alert" className="perfil-mensaje perfil-error">{error}</p>}
    {exito && <p role="status" className="perfil-mensaje perfil-exito">{exito}</p>}

    {usuario && perfil && <div className="perfil-distribucion">
      <aside className="perfil-lateral">
        <div className="perfil-tarjeta perfil-vista-previa">
          <span className="perfil-tarjeta-titulo">ASÍ SE VERÁ TU PERFIL</span>
          <div className="perfil-cabecera">
            <span className="perfil-avatar-grande" aria-hidden="true">{avatares.find(a => a.id === perfil.avatar)?.icono || '⚽'}</span>
            <div className="perfil-identidad">
              <h2>{perfil.nombre_visible || usuario.nombre}</h2>
              <p>@{perfil.alias}</p>
              <span className="perfil-rol">{usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}</span>
            </div>
          </div>
          {perfil.biografia && <p className="perfil-biografia-vista">{perfil.biografia}</p>}
          <div className="perfil-dato"><span>Equipo favorito</span><strong>{equipoFavorito?.nombre || 'Sin seleccionar'}</strong></div>
          <div className="perfil-dato"><span>Visibilidad</span><strong>{perfil.perfil_publico ? 'Público (próximamente)' : 'Privado'}</strong></div>
        </div>

        <div className="perfil-tarjeta perfil-seguridad">
          <h2>Cuenta y seguridad</h2>
          <div className="perfil-dato"><span>Correo</span><strong className="perfil-email">{usuario.email}</strong></div>
          <div className="perfil-dato"><span>Verificación</span><strong>{usuario.email_verificado ? 'Correo verificado' : 'Pendiente'}</strong></div>
          <p>Tu acceso con Google y la verificación en dos pasos se gestionan por separado.</p>
          <form className="perfil-cambiar-password" onSubmit={guardarPassword}>
            <h3>Contraseña de EstadLiga</h3>
            <p>Si entraste con Google y nunca creaste una contraseña, deja vacío el campo actual. Si ya tienes una, introdúcela para cambiarla.</p>
            <label>Contraseña actual <input type="password" autoComplete="current-password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} /></label>
            <label>Nueva contraseña <input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)} /></label>
            <label>Repetir contraseña <input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={passwordRepetida} onChange={e => setPasswordRepetida(e.target.value)} /></label>
            <button type="submit" className="boton-principal" disabled={guardandoPassword}>{guardandoPassword ? 'Guardando...' : 'Guardar contraseña'}</button>
          </form>
          <a className="perfil-enlace-seguridad" href="#/mi-cuenta/seguridad">Configurar seguridad <span aria-hidden="true">→</span></a>
        </div>
      </aside>

      <form onSubmit={guardar} className="perfil-formulario perfil-tarjeta">
        <div className="perfil-formulario-encabezado">
          <span className="perfil-tarjeta-titulo">TU ESPACIO EN ESTADLIGA</span>
          <h2>Personaliza tu perfil</h2>
          <p>Elige cómo quieres aparecer en EstadLiga.</p>
        </div>

        <div className="perfil-campos-dobles">
          <div className="perfil-campo">
            <label htmlFor="perfil-alias">Nombre de usuario</label>
            <input id="perfil-alias" required minLength={3} maxLength={24} pattern="[a-z0-9_]{3,24}" value={perfil.alias} onChange={e => cambiar('alias', e.target.value.toLowerCase())} autoComplete="nickname" />
            <small>De 3 a 24 caracteres: minúsculas, números y guion bajo.</small>
          </div>
          <div className="perfil-campo">
            <label htmlFor="perfil-nombre">Nombre para mostrar</label>
            <input id="perfil-nombre" required minLength={2} maxLength={60} value={perfil.nombre_visible} onChange={e => cambiar('nombre_visible', e.target.value)} />
          </div>
        </div>

        <div className="perfil-campo">
          <label htmlFor="perfil-equipo">Equipo favorito</label>
          <select id="perfil-equipo" value={perfil.equipo_favorito_id ?? ''} onChange={e => cambiar('equipo_favorito_id', e.target.value ? Number(e.target.value) : null)}>
            <option value="">Prefiero no elegir</option>
            {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        <div className="perfil-campo">
          <label htmlFor="perfil-bio">Biografía</label>
          <textarea id="perfil-bio" maxLength={240} rows={4} value={perfil.biografia} onChange={e => cambiar('biografia', e.target.value)} placeholder="Cuéntanos qué te gusta del fútbol..." />
          <small className="perfil-contador">{perfil.biografia.length}/240 caracteres</small>
        </div>

        <fieldset className="perfil-campo perfil-campo-avatares">
          <legend>Elige un avatar</legend>
          <div className="perfil-avatares">
            {avatares.map(a => <label key={a.id} className={perfil.avatar === a.id ? 'perfil-avatar elegido' : 'perfil-avatar'}>
              <input type="radio" name="avatar" value={a.id} checked={perfil.avatar === a.id} onChange={() => cambiar('avatar', a.id)} aria-label={`Avatar ${a.id}`} />
              <span aria-hidden="true">{a.icono}</span>
            </label>)}
          </div>
        </fieldset>

        <div className="perfil-campo">
          <label htmlFor="perfil-tema">Tema preferido</label>
          <select id="perfil-tema" value={perfil.tema} onChange={e => cambiar('tema', e.target.value)}>
            <option value="sistema">Según el dispositivo</option><option value="claro">Claro</option><option value="oscuro">Oscuro</option>
          </select>
          <small>Al guardar los cambios se aplicará el tema a toda EstadLiga.</small>
        </div>

        <label className="perfil-check"><input type="checkbox" checked={Boolean(perfil.perfil_publico)} onChange={e => cambiar('perfil_publico', e.target.checked ? 1 : 0)} /><span>Quiero que mi perfil sea público cuando se habiliten los perfiles de la comunidad.</span></label>

        <div className="perfil-acciones"><button className="boton-principal" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : nuevo ? 'Completar perfil' : 'Guardar cambios'}</button></div>
      </form>
    </div>}
  </section>
}
