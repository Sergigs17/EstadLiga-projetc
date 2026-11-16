import { useEffect, useState } from 'react'
import { aplicarTema, leerTema, type Tema } from '../utils/apariencia'
export default function SelectorTema() {
 const [tema, setTema] = useState<Tema>(leerTema)
 useEffect(() => { const actualizar = () => setTema(leerTema()); window.addEventListener('estadliga:tema', actualizar); return () => window.removeEventListener('estadliga:tema', actualizar) }, [])
 return <label className="selector-tema">Apariencia <select aria-label="Apariencia de EstadLiga" value={tema} onChange={e => { const nuevo = e.target.value as Tema; setTema(nuevo); aplicarTema(nuevo) }}><option value="sistema">Automático</option><option value="claro">Claro</option><option value="oscuro">Oscuro</option></select></label>
}
