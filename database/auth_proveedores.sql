-- Proveedores externos de autenticación de EstadLiga.
-- Permite vincular varias identidades a un mismo usuario.

CREATE TABLE IF NOT EXISTS usuarios_proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    usuario_id INTEGER NOT NULL,

    proveedor TEXT NOT NULL
        CHECK (
            proveedor IN (
                'google',
                'apple',
                'microsoft',
                'discord'
            )
        ),

    proveedor_id TEXT NOT NULL,

    email_proveedor TEXT,

    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (proveedor, proveedor_id),

    UNIQUE (usuario_id, proveedor),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_proveedores_usuario
ON usuarios_proveedores(usuario_id);
