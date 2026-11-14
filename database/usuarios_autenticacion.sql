-- EstadLiga · Sprint 3 · RF-05
-- Sistema de sesiones y autenticación en dos pasos.

-- Sesiones de usuarios.
CREATE TABLE IF NOT EXISTS sesiones_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en TEXT NOT NULL,
    revocado_en TEXT,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario
ON sesiones_usuarios(usuario_id);

CREATE INDEX IF NOT EXISTS idx_sesiones_expiracion
ON sesiones_usuarios(expira_en);

-- Configuración de autenticación en dos pasos.
CREATE TABLE IF NOT EXISTS usuarios_2fa (
    usuario_id INTEGER PRIMARY KEY,
    secreto_cifrado TEXT NOT NULL,
    activado INTEGER NOT NULL DEFAULT 0
        CHECK (activado IN (0, 1)),
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activado_en TEXT,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Códigos de recuperación de autenticación en dos pasos.
CREATE TABLE IF NOT EXISTS codigos_recuperacion_2fa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    codigo_hash TEXT NOT NULL UNIQUE,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    utilizado_en TEXT,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_codigos_recuperacion_usuario
ON codigos_recuperacion_2fa(usuario_id);
