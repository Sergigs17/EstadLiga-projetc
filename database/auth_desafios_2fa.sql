-- EstadLiga · RF-05
-- Desafíos temporales para completar el inicio de sesión con 2FA.

CREATE TABLE IF NOT EXISTS desafios_2fa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    creado_en INTEGER NOT NULL,
    expira_en INTEGER NOT NULL,
    utilizado_en INTEGER,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_desafios_2fa_usuario
ON desafios_2fa(usuario_id);

CREATE INDEX IF NOT EXISTS idx_desafios_2fa_expiracion
ON desafios_2fa(expira_en);
