-- Equipos favoritos de cada usuario.
CREATE TABLE IF NOT EXISTS favoritos_equipos (
    usuario_id INTEGER NOT NULL,
    equipo_id INTEGER NOT NULL,
    fecha_agregado TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (usuario_id, equipo_id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (equipo_id)
        REFERENCES equipos(id)
        ON DELETE CASCADE
);

-- Jugadores favoritos de cada usuario.
CREATE TABLE IF NOT EXISTS favoritos_jugadores (
    usuario_id INTEGER NOT NULL,
    jugador_id INTEGER NOT NULL,
    fecha_agregado TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (usuario_id, jugador_id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (jugador_id)
        REFERENCES jugadores(id)
        ON DELETE CASCADE
);

-- Notificaciones de los usuarios.
CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    equipo_id INTEGER,
    jugador_id INTEGER,
    leida INTEGER NOT NULL DEFAULT 0
        CHECK (leida IN (0, 1)),
    fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (equipo_id)
        REFERENCES equipos(id)
        ON DELETE SET NULL,

    FOREIGN KEY (jugador_id)
        REFERENCES jugadores(id)
        ON DELETE SET NULL
);

-- Índices para consultar las notificaciones.
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_fecha
ON notificaciones(usuario_id, fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida
ON notificaciones(usuario_id, leida);
