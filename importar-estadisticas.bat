
@echo off
setlocal

set "BASE=http://127.0.0.1:8787"
set "TORNEO=8"
set "TEMPORADA=97268"
set "LOTE=5"
set "OFFSET=0"

echo ==========================================
echo   IMPORTACION DE ESTADISTICAS - ESTADLIGA
echo ==========================================
echo.
echo Comprueba que el servidor Wrangler esta activo.
echo Pulsa una tecla para comenzar o CTRL+C para cancelar.
pause >nul

:IMPORTAR
echo.
echo Importando desde el jugador %OFFSET%...

curl.exe -s -f -X POST "%BASE%/api/estadisticas/importar?unique_tournament_id=%TORNEO%&season_id=%TEMPORADA%&offset=%OFFSET%&limite=%LOTE%" -o "%TEMP%\estadliga_respuesta.json"

if errorlevel 1 (
    echo ERROR: No se pudo completar la peticion.
    echo Comprueba que Wrangler sigue funcionando.
    pause
    exit /b 1
)

type "%TEMP%\estadliga_respuesta.json"
echo.


findstr /C:"\"jugadoresProcesados\":0" "%TEMP%\estadliga_respuesta.json" >nul
if not errorlevel 1 goto FIN

set /a OFFSET+=LOTE
if %OFFSET% GEQ 575 goto FIN

timeout /t 2 /nobreak >nul
goto IMPORTAR

:FIN
echo.
echo ==========================================
echo   IMPORTACION FINALIZADA
echo ==========================================
echo.
pause
