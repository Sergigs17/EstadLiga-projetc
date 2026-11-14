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

