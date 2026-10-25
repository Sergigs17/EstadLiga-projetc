import './Tienda.css'

function Tienda() {
  return (
    <section className="seccion-contenido pagina-tienda">
      <div className="titulo-seccion">
        <div>
          <span className="subtitulo">PRÓXIMAMENTE</span>
          <h2>Tienda EstadLiga</h2>
        </div>
        <p>Merchandising oficial</p>
      </div>

      <div className="tienda-desarrollo">
        <div className="tienda-icono" aria-hidden="true">🛍️</div>
        <h3>Tienda en desarrollo</h3>
        <p>
          Estamos preparando la tienda de EstadLiga con camisetas, bufandas y
          artículos de tus equipos favoritos. Muy pronto podrás verla aquí.
        </p>
        <span>🚧 En desarrollo</span>
      </div>
    </section>
  )
}

export default Tienda