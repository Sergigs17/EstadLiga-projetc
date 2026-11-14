-- EstadLiga: verificación de correo (ejecutar una sola vez en D1 local de pruebas).
-- Las cuentas existentes se consideran verificadas para evitar bloquear accesos previos.
ALTER TABLE usuarios ADD COLUMN email_verificado INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS verificaciones_email (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TEXT NOT NULL,
  consumido_en TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_verificaciones_email_usuario
  ON verificaciones_email(usuario_id);
