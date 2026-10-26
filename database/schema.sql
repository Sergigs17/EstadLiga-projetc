
PRAGMA foreign_keys = ON;

-- 1. Equipos
CREATE TABLE IF NOT EXISTS equipos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    escudo TEXT,
    entrenador TEXT,
    estadio TEXT,
    ciudad TEXT,
    api_id INTEGER UNIQUE
);

-- 2. Jugadores
CREATE TABLE IF NOT EXISTS jugadores (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT,
    posicion TEXT,
    nacionalidad TEXT,
    fecha_nacimiento TEXT,
    dorsal INTEGER,
    equipo_id INTEGER,
    api_id INTEGER UNIQUE,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
        ON DELETE SET NULL
);

-- 3. Partidos
CREATE TABLE IF NOT EXISTS partidos (
    id INTEGER PRIMARY KEY,
    jornada INTEGER NOT NULL,
    fecha TEXT,
    estado TEXT,
    goles_local INTEGER,
    goles_visitante INTEGER,
    equipo_local_id INTEGER NOT NULL,
    equipo_visitante_id INTEGER NOT NULL,
    api_id INTEGER UNIQUE,
    FOREIGN KEY (equipo_local_id) REFERENCES equipos(id),
    FOREIGN KEY (equipo_visitante_id) REFERENCES equipos(id),
    CHECK (equipo_local_id != equipo_visitante_id)
);

-- 4. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario'
        CHECK (rol IN ('usuario', 'admin')),
    fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Equipos favoritos
CREATE TABLE IF NOT EXISTS usuario_equipo_favorito (
    usuario_id INTEGER NOT NULL,
    equipo_id INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, equipo_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
        ON DELETE CASCADE
);

-- 6. Jugadores favoritos
CREATE TABLE IF NOT EXISTS usuario_jugador_favorito (
    usuario_id INTEGER NOT NULL,
    jugador_id INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, jugador_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id)
        ON DELETE CASCADE
);

-- 7. Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida INTEGER NOT NULL DEFAULT 0
        CHECK (leida IN (0, 1)),
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- 8. Suscripciones prémium
CREATE TABLE IF NOT EXISTS suscripciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    estado TEXT NOT NULL DEFAULT 'activa',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- 9. Descuentos
CREATE TABLE IF NOT EXISTS descuentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    porcentaje REAL NOT NULL
        CHECK (porcentaje > 0 AND porcentaje <= 100),
    activo INTEGER NOT NULL DEFAULT 1
        CHECK (activo IN (0, 1))
);

-- 10. Productos
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL CHECK (precio >= 0),
    imagen TEXT,
    equipo_id INTEGER,
    descuento_id INTEGER,
    solo_premium INTEGER NOT NULL DEFAULT 0
        CHECK (solo_premium IN (0, 1)),
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
        ON DELETE SET NULL,
    FOREIGN KEY (descuento_id) REFERENCES descuentos(id)
        ON DELETE SET NULL
);

-- 11. Predicciones
CREATE TABLE IF NOT EXISTS predicciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    partido_id INTEGER NOT NULL,
    goles_local INTEGER NOT NULL CHECK (goles_local >= 0),
    goles_visitante INTEGER NOT NULL CHECK (goles_visitante >= 0),
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, partido_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    FOREIGN KEY (partido_id) REFERENCES partidos(id)
        ON DELETE CASCADE
);

-- 12. Noticias
CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    resumen TEXT,
    contenido TEXT NOT NULL,
    imagen TEXT,
    fecha_publicacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    equipo_id INTEGER,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
        ON DELETE SET NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_jugadores_equipo
    ON jugadores(equipo_id);

CREATE INDEX IF NOT EXISTS idx_partidos_fecha
    ON partidos(fecha);

CREATE INDEX IF NOT EXISTS idx_partidos_jornada
    ON partidos(jornada);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario
    ON notificaciones(usuario_id);
