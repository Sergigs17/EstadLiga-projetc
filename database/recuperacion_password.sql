-- Ejecutar una vez en Cloudflare D1 antes de publicar la recuperación.
CREATE TABLE IF NOT EXISTS recuperaciones_password (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TEXT NOT NULL,
  usado_en TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_recuperaciones_password_usuario ON recuperaciones_password(usuario_id);
