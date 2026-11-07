
import './Cargando.css'

interface CargandoProps {
  mensaje?: string
}

function Cargando({
  mensaje = 'Cargando datos...',
}: CargandoProps) {
  return (
    <div className="estadliga-cargando" role="status" aria-live="polite">
      <div className="estadliga-spinner" aria-hidden="true">
        <span className="estadliga-spinner-balon">⚽</span>
      </div>

      <p className="estadliga-cargando-mensaje">{mensaje}</p>
    </div>
  )
}

export default Cargando
