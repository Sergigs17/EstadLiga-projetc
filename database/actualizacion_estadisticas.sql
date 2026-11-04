CREATE TABLE IF NOT EXISTS control_actualizacion_estadisticas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    semana TEXT NOT NULL UNIQUE,
    estado TEXT NOT NULL DEFAULT 'equipos'
        CHECK (estado IN (
            'equipos',
            'jugadores',
            'reintentos',
            'completada',
            'completada_con_errores'
        )),
    ultimo_equipo_id INTEGER NOT NULL DEFAULT 0,
    ultimo_jugador_id INTEGER NOT NULL DEFAULT 0,
    total_equipos INTEGER NOT NULL DEFAULT 0,
    total_jugadores INTEGER NOT NULL DEFAULT 0,
    equipos_ok INTEGER NOT NULL DEFAULT 0,
    jugadores_ok INTEGER NOT NULL DEFAULT 0,
    errores INTEGER NOT NULL DEFAULT 0,
    iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finalizado_en TEXT
);

CREATE TABLE IF NOT EXISTS errores_actualizacion_estadisticas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actualizacion_id INTEGER NOT NULL,
    tipo TEXT NOT NULL
        CHECK (tipo IN ('plantilla', 'equipo', 'jugador')),
    entidad_id INTEGER NOT NULL,
    nombre TEXT,
    intentos INTEGER NOT NULL DEFAULT 1,
    ultimo_error TEXT,
    resuelto INTEGER NOT NULL DEFAULT 0
        CHECK (resuelto IN (0, 1)),
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actualizacion_id)
        REFERENCES control_actualizacion_estadisticas(id)
        ON DELETE CASCADE,
    UNIQUE (actualizacion_id, tipo, entidad_id)
);

CREATE INDEX IF NOT EXISTS idx_errores_actualizacion_pendientes
    ON errores_actualizacion_estadisticas(actualizacion_id, resuelto);
