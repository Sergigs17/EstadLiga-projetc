CREATE TABLE IF NOT EXISTS estadisticas_jugadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jugador_id INTEGER NOT NULL,
  unique_tournament_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  estadisticas_json TEXT NOT NULL,
  actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(jugador_id, unique_tournament_id, season_id),
  FOREIGN KEY(jugador_id) REFERENCES jugadores(id)
);

CREATE TABLE IF NOT EXISTS estadisticas_equipos (
  equipo_id INTEGER NOT NULL,
  unique_tournament_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  estadisticas_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (equipo_id, unique_tournament_id, season_id),
  FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE IF NOT EXISTS clasificacion_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  datos_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partidos_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  datos_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
