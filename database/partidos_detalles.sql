-- Ejecutar una sola vez en D1 antes de desplegar el Worker.
CREATE TABLE IF NOT EXISTS detalles_partidos_cache (
  partido_id INTEGER PRIMARY KEY,
  datos_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
