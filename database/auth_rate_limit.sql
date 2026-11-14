-- EstadLiga · RF-05
-- Control de intentos de autenticación.

CREATE TABLE IF NOT EXISTS auth_intentos (
    clave TEXT PRIMARY KEY,
    intentos INTEGER NOT NULL DEFAULT 0,
    ventana_inicio INTEGER NOT NULL,
    bloqueado_hasta INTEGER NOT NULL DEFAULT 0,
    actualizado_en INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_intentos_actualizado
ON auth_intentos(actualizado_en);
