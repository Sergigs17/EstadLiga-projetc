import { useState } from 'react'
import './PreferenciasCookies.css'
const CLAVE = 'estadliga-consentimiento-v1'
type Decision = 'necesarias' | 'todas'
function leerDecision(): Decision | null {
  try { const valor = localStorage.getItem(CLAVE); return valor === 'necesarias' || valor === 'todas' ? valor : null } catch { return null }
}
export default function PreferenciasCookies() {
  const [decision, setDecision] = useState<Decision | null>(leerDecision)
  const [abierto, setAbierto] = useState(false)
  function elegir(valor: Decision) {
    try { localStorage.setItem(CLAVE, valor) } catch { /* El aviso reaparecerá si el almacenamiento está bloqueado */ }
    setDecision(valor); setAbierto(false)
    // No se instala ninguna herramienta de analítica: aceptar no carga rastreadores.
  }
  return <>
    <button type="button" className="cookies-enlace" onClick={() => setAbierto(true)}>Configurar cookies</button>
    {(!decision || abierto) && <div className="cookies-capa" role="dialog" aria-modal="true" aria-labelledby="cookies-titulo">
      <div className="cookies-panel">
        <h2 id="cookies-titulo">🍪 Tu privacidad en EstadLiga</h2>
        <p>Usamos una cookie de sesión necesaria para mantener tu acceso. También guardamos localmente tu tema y tu elección de privacidad. Actualmente no utilizamos cookies de publicidad ni herramientas de analítica.</p>
        <div className="cookies-detalle"><strong>Necesarias</strong><span>Sesión y seguridad. Siempre activas.</span></div>
        <div className="cookies-detalle"><strong>Preferencias locales</strong><span>Modo claro/oscuro y decisión sobre este aviso, guardados en tu navegador.</span></div>
        <p className="cookies-nota">La opción «Aceptar todas» no activa cookies adicionales actualmente. Si incorporamos analítica opcional en el futuro, solicitaremos un consentimiento específico antes de activarla.</p>
        <div className="cookies-botones"><button type="button" onClick={() => elegir('necesarias')}>Solo necesarias</button><button type="button" className="cookies-aceptar" onClick={() => elegir('todas')}>Aceptar todas</button>{decision && <button type="button" onClick={() => setAbierto(false)}>Cerrar</button>}</div>
      </div>
    </div>}
  </>
}
