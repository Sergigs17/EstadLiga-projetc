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
