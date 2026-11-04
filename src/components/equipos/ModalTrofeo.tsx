import { useEffect, useRef, useState } from 'react'
import {
  ETIQUETA_CATEGORIA,
  TROFEOS,
  type ClaveTrofeo,
} from '../../data/trofeos'
import './ModalTrofeo.css'

interface ModalTrofeoProps {
  /** Trofeo que se muestra. null = viñeta cerrada. */
  clave: ClaveTrofeo | null
  /** Si el club tiene este título, se muestra cuántos. */
  titulosClub?: { club: string; cantidad: number | null; anios?: string }
  onCerrar: () => void
}

/** Imagen grande del trofeo, con 🏆 si el archivo no existe. */
function ImagenGrande({ src, alt }: { src: string; alt: string }) {
  const [fallida, setFallida] = useState(false)

  if (fallida) {
    return (
      <span className="mt-imagen-vacia" aria-hidden="true">
        🏆
      </span>
    )
  }

  return <img src={src} alt={alt} onError={() => setFallida(true)} />
}

function ModalTrofeo({ clave, titulosClub, onCerrar }: ModalTrofeoProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const info = clave ? TROFEOS[clave] : null

  // Abre y cierra el <dialog> nativo: ya trae foco atrapado, Esc y fondo.
  useEffect(() => {
    const el = dialogo.current
    if (!el) return

    if (info && !el.open) {
      el.showModal()
      document.body.style.overflow = 'hidden'
    }

    if (!info && el.open) {
      el.close()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [info])

  return (
    <dialog
      ref={dialogo}
      className="mt-dialogo"
      aria-labelledby="mt-titulo"
      onClose={onCerrar}
      onClick={(evento) => {
        // Un clic en el fondo oscuro (fuera de la tarjeta) cierra la viñeta.
        if (evento.target === dialogo.current) dialogo.current?.close()
      }}
    >
      {info && (
        <article className="mt-tarjeta">
          <button
            type="button"
            className="mt-cerrar"
            onClick={() => dialogo.current?.close()}
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div className="mt-vitrina">
            <ImagenGrande src={info.imagen} alt={`Trofeo: ${info.nombre}`} />
          </div>

          <div className="mt-contenido">
            <span className="mt-categoria">{ETIQUETA_CATEGORIA[info.categoria]}</span>
            <h2 id="mt-titulo">{info.nombre}</h2>

            <div className="mt-etiquetas">
              <span>📅 {info.periodo}</span>
              {info.organizador && <span>🏛️ {info.organizador}</span>}
            </div>

            {titulosClub && (
              <p className="mt-club">
                {titulosClub.cantidad === null ? (
                  <>
                    <b>{titulosClub.club}</b>: cantidad de títulos pendiente de verificar
                  </>
                ) : (
                  <>
                    <b>{titulosClub.club}</b> tiene{' '}
                    <strong>
                      {titulosClub.cantidad}{' '}
                      {titulosClub.cantidad === 1 ? 'título' : 'títulos'}
                    </strong>
                    {titulosClub.anios && <> ({titulosClub.anios})</>}
                  </>
                )}
              </p>
            )}

            <h3>Su historia</h3>
            {info.historia.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}

            {info.campeonesEspanoles && info.campeonesEspanoles.length > 0 && (
              <>
                <h3>Campeones españoles</h3>
                <ul className="mt-lista">
                  {info.campeonesEspanoles.map((linea) => (
                    <li key={linea}>{linea}</li>
                  ))}
                </ul>
              </>
            )}

            {info.datos && info.datos.length > 0 && (
              <>
                <h3>Datos curiosos</h3>
                <ul className="mt-lista mt-datos">
                  {info.datos.map((linea) => (
                    <li key={linea}>{linea}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </article>
      )}
    </dialog>
  )
}

export default ModalTrofeo