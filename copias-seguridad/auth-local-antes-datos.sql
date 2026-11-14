PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario'
        CHECK (rol IN ('usuario', 'admin')),
    fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "usuarios" ("id","nombre","email","password_hash","rol","fecha_registro") VALUES(1,'Usuario Prueba','prueba-2fa@estadliga.test','pbkdf2_sha256$600000$3fe5512cd2d921975c28c7cc7ea12087$5de3c49304c230c2bb6ddd2fa7d99ae614e150ae3dfa82790991c12db40307ee','usuario','2026-11-10 20:06:05');
CREATE TABLE sesiones_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en TEXT NOT NULL,
    revocado_en TEXT,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);
INSERT INTO "sesiones_usuarios" ("id","usuario_id","token_hash","creado_en","expira_en","revocado_en") VALUES(1,1,'af70677fbce1fa5bb119953dc901ab05cdd9ce72a05fb858fec4ad2a523e7b13','2026-11-10 20:06:24','2026-11-17T20:06:24.810Z',NULL);
INSERT INTO "sesiones_usuarios" ("id","usuario_id","token_hash","creado_en","expira_en","revocado_en") VALUES(2,1,'80b681f036fa95c476e52c11ac289784c67b1b42721d1f913cd33ab04d38102d','2026-11-10 20:10:45','2026-11-17T20:10:45.526Z',NULL);
INSERT INTO "sesiones_usuarios" ("id","usuario_id","token_hash","creado_en","expira_en","revocado_en") VALUES(3,1,'75ac650d82d4f69c5d6d1deb50f31f82e9d6cf75b3b44c74c0f30247c2c398de','2026-11-10 20:12:16','2026-11-17T20:12:16.025Z',NULL);
CREATE TABLE usuarios_2fa (
    usuario_id INTEGER PRIMARY KEY,
    secreto_cifrado TEXT NOT NULL,
    activado INTEGER NOT NULL DEFAULT 0
        CHECK (activado IN (0, 1)),
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activado_en TEXT, ultimo_paso_totp INTEGER NOT NULL DEFAULT -1,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);
INSERT INTO "usuarios_2fa" ("usuario_id","secreto_cifrado","activado","creado_en","activado_en","ultimo_paso_totp") VALUES(1,'BPRLIihvkXerDMjM.hTgNV73/EJmttGos5ZKYfLfqRuhhH/JQ79T73OrCucs2XwwwpIvGr7fxxQQ9+cBX',1,'2026-11-10 20:07:19','2026-11-10 20:09:08',59811384);
CREATE TABLE codigos_recuperacion_2fa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    codigo_hash TEXT NOT NULL UNIQUE,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    utilizado_en TEXT,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(1,1,'8ffec48cdb8a99da0b8682bec2be88fcf4c7111343c7281c4d9b00883f96e585','2026-11-10 20:09:08','2026-11-10 20:10:45');
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(2,1,'cc34b9a93916cf610ebba58f337a67aaa8f93f7f0aff3d4f5c56e612c5855dae','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(3,1,'9c798ab31a4ca9457228766aa5c0ac743fb7e470f86012fad312bc1ebc285ba3','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(4,1,'9e5f01cb6e8a44d580f438c1e52ca49a128a4aeaa42f4ca29749b4b36b251a01','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(5,1,'43d92689cfdf95fd86456207552514adf071c8c68f6ffa6a30e009d07b600406','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(6,1,'02ba9e9c7e282842fb7d2a80bb51daaff4f85cea04c22c793a3dc6cd196a2714','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(7,1,'2ef781d1ea1a621951c872a2119a1bcc70b7a3070990dc8c6f7f247d80bc2d5d','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(8,1,'07c8fdbb7b36045091a87c3e3096a8f222609111a4893e6e350793d2fccb5b53','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(9,1,'89a84281310eaf8d920b2f216c13b9eff2387a0ea8795bc9ee1bb22b7fba71ad','2026-11-10 20:09:08',NULL);
INSERT INTO "codigos_recuperacion_2fa" ("id","usuario_id","codigo_hash","creado_en","utilizado_en") VALUES(10,1,'823339430751a228c4f7acd97d8745bb7218ec98dbdf2122f90ebadb942e21be','2026-11-10 20:09:08',NULL);
CREATE TABLE auth_intentos (
    clave TEXT PRIMARY KEY,
    intentos INTEGER NOT NULL DEFAULT 0,
    ventana_inicio INTEGER NOT NULL,
    bloqueado_hasta INTEGER NOT NULL DEFAULT 0,
    actualizado_en INTEGER NOT NULL
);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('df08eee25896f0675ddb3e1d3bb8b439cc35a8f83cd34de3ae6154480c3509d8',1,1794340800,0,1794341165);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('ada37aa77459ce3fe82aeb26396ba45d69e70958842301ca55e5f29e70dcbc3c',1,1794340800,0,1794341165);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('549f23efad7d30949c74c9b0b95c53e76b6040881d28f56cb44eef410391416f',1,1794656700,0,1794657051);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('5e409c880d8eb1f6ce42434722f047fd1fed78f1d98e042c15ab8d0756dcb2ac',8,1794340800,0,1794341688);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('d46f7c94d483aaf7fb625f77b1a9bf46536fcc4d50920f5007f7f3e89fa41c21',1,1794340800,0,1794341239);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('002f3e18e9a8510bfffb991dec7df27c5f1e9b0181bc913c30767da17454f448',1,1794340800,0,1794341239);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('1bea623732967ef26cdf856f7470726a557548a2b05cafec0c9dc8d855068bf6',1,1794340800,0,1794341348);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('4eda773269822077b33288d5984b9fefb2db145662ae3a52e7388aed542188bb',1,1794340800,0,1794341348);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('576476c15b6936cdb8a3d665bcf8650e93685142da21ec5f0c1344f340e2a1f1',3,1794341400,0,1794341536);
INSERT INTO "auth_intentos" ("clave","intentos","ventana_inicio","bloqueado_hasta","actualizado_en") VALUES('63de8253858fd2b0b52154b701a4eeee21e3a7a583540a1bb2f3d6ac129438c3',3,1794341400,0,1794341536);
CREATE TABLE desafios_2fa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    creado_en INTEGER NOT NULL,
    expira_en INTEGER NOT NULL,
    utilizado_en INTEGER,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);
INSERT INTO "desafios_2fa" ("id","usuario_id","token_hash","creado_en","expira_en","utilizado_en") VALUES(1,1,'21d8c9d2f9f04f4124e28109c26dc01a3522c87bd5c7f9ffdfcf90b4cf98f06d',1794341401,1794341701,NULL);
INSERT INTO "desafios_2fa" ("id","usuario_id","token_hash","creado_en","expira_en","utilizado_en") VALUES(2,1,'23e8be3a9ab7273326d8c52580b2d4529610363c2f01e7243a5b706a8ace1b34',1794341445,1794341745,1794341445);
INSERT INTO "desafios_2fa" ("id","usuario_id","token_hash","creado_en","expira_en","utilizado_en") VALUES(3,1,'458b52d22e882ce779d8ec42006f7d78643d116916b7f7a12ec28d40cb821ddb',1794341501,1794341801,NULL);
INSERT INTO "desafios_2fa" ("id","usuario_id","token_hash","creado_en","expira_en","utilizado_en") VALUES(4,1,'9cea8b3fb5542db9984702c936ee4b423cfcdee8d84f58d454bfd7a73e5fd331',1794341521,1794341821,1794341536);
CREATE TABLE usuarios_proveedores (
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
CREATE TABLE equipos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    escudo TEXT,
    entrenador TEXT,
    estadio TEXT,
    ciudad TEXT,
    api_id INTEGER UNIQUE
);
CREATE TABLE jugadores (
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
CREATE TABLE partidos (
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
CREATE TABLE estadisticas_jugadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jugador_id INTEGER NOT NULL,
  unique_tournament_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  estadisticas_json TEXT NOT NULL,
  actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(jugador_id, unique_tournament_id, season_id),
  FOREIGN KEY(jugador_id) REFERENCES jugadores(id)
);
CREATE TABLE estadisticas_equipos (
  equipo_id INTEGER NOT NULL,
  unique_tournament_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  estadisticas_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (equipo_id, unique_tournament_id, season_id),
  FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);
CREATE TABLE clasificacion_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  datos_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
CREATE TABLE partidos_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  datos_json TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('usuarios',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('sesiones_usuarios',3);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('codigos_recuperacion_2fa',10);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('desafios_2fa',4);
CREATE INDEX idx_sesiones_usuario
ON sesiones_usuarios(usuario_id);
CREATE INDEX idx_sesiones_expiracion
ON sesiones_usuarios(expira_en);
CREATE INDEX idx_codigos_recuperacion_usuario
ON codigos_recuperacion_2fa(usuario_id);
CREATE INDEX idx_auth_intentos_actualizado
ON auth_intentos(actualizado_en);
CREATE INDEX idx_desafios_2fa_usuario
ON desafios_2fa(usuario_id);
CREATE INDEX idx_desafios_2fa_expiracion
ON desafios_2fa(expira_en);
CREATE INDEX idx_usuarios_proveedores_usuario
ON usuarios_proveedores(usuario_id);