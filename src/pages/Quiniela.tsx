import './Quiniela.css'

type Marca = '1' | 'X' | '2' | null

interface PartidoEjemplo {
  local: string
  escudoLocal: string
  visitante: string
  escudoVisitante: string
  marca: Marca
}

// Partidos inventados solo para enseñar cómo será el boleto.
const PARTIDOS_EJEMPLO: PartidoEjemplo[] = [
  {
    local: 'FC Barcelona',
    escudoLocal: '/escudos/barcelona.png',
    visitante: 'Real Madrid',
    escudoVisitante: '/escudos/realmadrid.png',
    marca: '1',
  },
  {
    local: 'Athletic Club',
    escudoLocal: '/escudos/athletic.png',
    visitante: 'Atlético de Madrid',
    escudoVisitante: '/escudos/atlmadrid.png',
    marca: 'X',
  },
  {
    local: 'Sevilla FC',
    escudoLocal: '/escudos/sevilla.png',
    visitante: 'Real Betis',
    escudoVisitante: '/escudos/betis.png',
    marca: '2',
  },
  {
    local: 'Valencia CF',
    escudoLocal: '/escudos/valencia.png',
    visitante: 'Villarreal CF',
    escudoVisitante: '/escudos/villarreal.png',
    marca: null,
  },
]

const OPCIONES = ['1', 'X', '2'] as const

const PASOS = [
  {
    titulo: 'Elige la jornada',
    texto: 'Tendrás una quiniela con los partidos de Primera División.',
  },
  {
    titulo: 'Haz tu pronóstico',
    texto:
      'Marca 1, X o 2 en cada partido: gana el local, empate o gana el visitante.',
  },
  {
    titulo: 'Comprueba tus aciertos',
    texto: 'Cuando terminen los partidos verás cuántos has acertado.',
  },
]

function Quiniela() {
  return (
    <section className="seccion-contenido pagina-quiniela">
      <div className="quiniela-aviso" role="status">
        <span className="quiniela-aviso-punto" aria-hidden="true" />
        <strong>En desarrollo</strong>
        <span>
          Esta sección todavía no está disponible, estamos trabajando en ella.
        </span>
      </div>

      <div className="quiniela-cuerpo">
        <div className="quiniela-intro">
          <span className="subtitulo">PRONOSTICA LA JORNADA</span>
          <h2>Quiniela de LaLiga</h2>
          <p className="quiniela-lead">
            Muy pronto podrás hacer tu propia quiniela: elige el resultado de
            cada partido y descubre cuánto sabes de fútbol.
          </p>

          <ol className="quiniela-pasos">
            {PASOS.map((paso, indice) => (
              <li key={paso.titulo}>
                <span className="quiniela-paso-numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <div>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <button className="quiniela-boton" type="button" disabled>
            Próximamente
          </button>
        </div>

        {/* Vista previa decorativa: no es interactiva */}
        <div className="quiniela-vista" aria-hidden="true">
          <div className="quiniela-boleto">
            <div className="quiniela-boleto-cabecera">
              <span>Jornada de ejemplo</span>
              <span className="quiniela-etiqueta">Vista previa</span>
            </div>

            <ul className="quiniela-partidos">
              {PARTIDOS_EJEMPLO.map((partido) => (
                <li key={partido.local} className="quiniela-partido">
                  <span className="quiniela-equipo quiniela-equipo--local">
                    <span className="quiniela-nombre">{partido.local}</span>
                    <img src={partido.escudoLocal} alt="" />
                  </span>

                  <span className="quiniela-opciones">
                    {OPCIONES.map((opcion) => (
                      <span
                        key={opcion}
                        className={
                          'quiniela-opcion' +
                          (partido.marca === opcion
                            ? ' quiniela-opcion--marcada'
                            : '')
                        }
                      >
                        {opcion}
                      </span>
                    ))}
                  </span>

                  <span className="quiniela-equipo quiniela-equipo--visitante">
                    <img src={partido.escudoVisitante} alt="" />
                    <span className="quiniela-nombre">{partido.visitante}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="quiniela-boleto-pie">
              Partidos de ejemplo · no son reales
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Quiniela