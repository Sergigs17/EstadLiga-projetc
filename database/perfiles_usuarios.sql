-- Perfil opcional, independiente de la autenticación y del segundo factor.
CREATE TABLE IF NOT EXISTS perfiles_usuarios (
  usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  alias TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nombre_visible TEXT NOT NULL,
  biografia TEXT NOT NULL DEFAULT '',
  equipo_favorito_id INTEGER REFERENCES equipos(id) ON DELETE SET NULL,
  avatar TEXT NOT NULL DEFAULT 'balon',
  tema TEXT NOT NULL DEFAULT 'sistema' CHECK (tema IN ('sistema','claro','oscuro')),
  perfil_publico INTEGER NOT NULL DEFAULT 0 CHECK (perfil_publico IN (0,1)),
  completado INTEGER NOT NULL DEFAULT 0 CHECK (completado IN (0,1)),
  actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_perfiles_equipo ON perfiles_usuarios(equipo_favorito_id);
