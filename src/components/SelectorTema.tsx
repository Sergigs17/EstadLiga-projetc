import { useEffect, useState } from 'react'
import { aplicarTema, leerTema } from '../utils/apariencia'
import './SelectorTema.css'

function esOscuro() {
  const tema = leerTema()
  return tema === 'oscuro' || (tema === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export default function SelectorTema() {
  const [oscuro, setOscuro] = useState(esOscuro)

  useEffect(() => {
    const actualizar = () => setOscuro(esOscuro())
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    window.addEventListener('estadliga:tema', actualizar)
    media.addEventListener('change', actualizar)
    return () => {
      window.removeEventListener('estadliga:tema', actualizar)
      media.removeEventListener('change', actualizar)
    }
  }, [])

  return (
    <button
      className="selector-tema-boton"
      type="button"
      aria-label={oscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={oscuro}
      onClick={() => aplicarTema(oscuro ? 'claro' : 'oscuro')}
    >
      <span aria-hidden="true">{oscuro ? '🌙' : '☀️'}</span>
    </button>
  )
}
