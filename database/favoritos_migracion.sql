CREATE TABLE IF NOT EXISTS favoritos_equipos (
  usuario_id INTEGER NOT NULL,
  equipo_id INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, equipo_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favoritos_jugadores (
  usuario_id INTEGER NOT NULL,
  jugador_id INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, jugador_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
);
