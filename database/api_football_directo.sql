
CREATE TABLE IF NOT EXISTS api_football_partidos (
    fixture_id INTEGER PRIMARY KEY,
    league_id INTEGER NOT NULL,
    season INTEGER NOT NULL,
    fecha TEXT,
    estado TEXT,
    actualizado_en TEXT NOT NULL,
    datos_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_football_partidos_fecha
ON api_football_partidos(fecha);

CREATE TABLE IF NOT EXISTS api_football_control (
    fecha TEXT PRIMARY KEY,
    peticiones INTEGER NOT NULL DEFAULT 0,
    actualizado_en TEXT NOT NULL
);
