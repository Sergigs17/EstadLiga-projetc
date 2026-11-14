CREATE TABLE IF NOT EXISTS prueba_transaccion_2fa (
  id INTEGER PRIMARY KEY,
  consumido INTEGER NOT NULL DEFAULT 0
);

INSERT OR REPLACE INTO prueba_transaccion_2fa (id, consumido)
VALUES (1, 0);

UPDATE prueba_transaccion_2fa
SET consumido = 1
WHERE id = 1 AND consumido = 0;

SELECT CASE
  WHEN changes() = 1 THEN 1
  ELSE json_extract('invalid-json', '$')
END AS comprobacion;

UPDATE prueba_transaccion_2fa
SET consumido = 1
WHERE id = 999;

SELECT CASE
  WHEN changes() = 1 THEN 1
  ELSE json_extract('invalid-json', '$')
END AS comprobacion;
