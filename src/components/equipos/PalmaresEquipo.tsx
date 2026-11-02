import { useState } from 'react'
import type { Equipo } from '../../pages/Equipos'
import { PALMARES, PALMARES_ACTUALIZADO, type CarpetaClub } from '../../data/palmares'
import { TROFEOS, type ClaveTrofeo } from '../../data/trofeos'
import { obtenerSlugClub } from '../../utils/clubes'
import ModalTrofeo from './ModalTrofeo'
import './PalmaresEquipo.css'

interface PalmaresEquipoProps {
  equipo: Equipo
}

/** Imagen de un trofeo. Si el archivo no existe, se ve un 🏆. */
function ImagenTrofeo({ clave }: { clave: ClaveTrofeo }) {
  const [fallida, setFallida] = useState(false)
  const info = TROFEOS[clave]

  if (fallida) {
    return (
      <span className="pal-imagen pal-imagen-vacia" aria-hidden="true">
        🏆
      </span>
    )
  }

  return (
    <span className="pal-imagen">
      <img
        src={info.imagen}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFallida(true)}
      />
    </span>
  )
}

function PalmaresEquipo({ equipo }: PalmaresEquipoProps) {
  const [abierto, setAbierto] = useState<ClaveTrofeo | null>(null)

  const slug = obtenerSlugClub(equipo.nombre) as CarpetaClub | null
  const titulos = slug ? (PALMARES[slug] ?? []) : []
  const titulosAbierto = titulos.find((t) => t.clave === abierto)

  return (
    <section className="bloque-palmares-equipo">
      <div className="encabezado-bloque-equipo">
        <span className="subtitulo">SUS LOGROS</span>
        <h2>Palmarés</h2>
        <p>
          {titulos.length > 0
            ? 'Toca un trofeo para conocer su historia.'
            : 'Los títulos oficiales del club.'}
        </p>
      </div>

      {titulos.length > 0 ? (
        <div className="pal-rejilla">
          {titulos.map((titulo) => {
            const info = TROFEOS[titulo.clave]

            return (
              <button
                type="button"
                className="pal-tarjeta"
                key={titulo.clave}
                onClick={() => setAbierto(titulo.clave)}
                aria-label={`${info.nombre}: ver su historia`}
              >
                <ImagenTrofeo clave={titulo.clave} />

                <span className="pal-info">
                  <strong>{info.nombre}</strong>

                  {titulo.cantidad === null ? (
                    <span className="pal-pendiente">Cantidad pendiente de verificar</span>
                  ) : (
                    <span className="pal-cantidad">
                      <b>{titulo.cantidad}</b>
                      {titulo.cantidad === 1 ? ' título' : ' títulos'}
                    </span>
                  )}

                  {titulo.anios && <small>{titulo.anios}</small>}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="pal-preparando">
          <span aria-hidden="true">🏆</span>
          <p>
            {equipo.nombre} no tiene ningún título en las competiciones que recoge esta
            página.
          </p>
        </div>
      )}

      <p className="pal-nota">
        Títulos oficiales en LaLiga, Copa del Rey, Supercopa, competiciones europeas y mundiales, y
        otros torneos históricos. Datos actualizados en {PALMARES_ACTUALIZADO}; el recuento puede variar
        según la fuente en algunos casos concretos.
      </p>

      <ModalTrofeo
        clave={abierto}
        titulosClub={
          titulosAbierto
            ? {
                club: equipo.nombre,
                cantidad: titulosAbierto.cantidad,
                anios: titulosAbierto.anios,
              }
            : undefined
        }
        onCerrar={() => setAbierto(null)}
      />
    </section>
  )
}

export default PalmaresEquipo
