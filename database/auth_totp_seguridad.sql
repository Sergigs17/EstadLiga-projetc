-- EstadLiga · RF-05
-- Protección contra reutilización de códigos TOTP.

ALTER TABLE usuarios_2fa
ADD COLUMN ultimo_paso_totp INTEGER NOT NULL DEFAULT -1;
