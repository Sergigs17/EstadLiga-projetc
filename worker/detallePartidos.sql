CREATE TABLE IF NOT EXISTS api_football_detalles (
  partido_id INTEGER PRIMARY KEY,
  datos_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
