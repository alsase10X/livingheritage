@echo off
REM Script simplificado para iniciar el servidor
REM Usa Node directamente con la ruta completa

echo ========================================
echo Iniciando servidor de desarrollo
echo ========================================
echo.

REM Cambiar a Node 20.19.2
echo [1/3] Cambiando a Node.js 20.19.2...
call nvm use 20.19.2 >nul 2>&1

REM Obtener la ruta de Node
REM Intentar diferentes ubicaciones comunes de nvm
set "NODE_EXE="

if exist "C:\nvm\v20.19.2\node.exe" (
    set "NODE_EXE=C:\nvm\v20.19.2\node.exe"
    set "NODE_PATH=C:\nvm\v20.19.2"
) else if exist "%USERPROFILE%\AppData\Roaming\nvm\v20.19.2\node.exe" (
    set "NODE_EXE=%USERPROFILE%\AppData\Roaming\nvm\v20.19.2\node.exe"
    set "NODE_PATH=%USERPROFILE%\AppData\Roaming\nvm\v20.19.2"
) else (
    echo ERROR: Node.js 20.19.2 no encontrado
    echo.
    echo Buscando en:
    echo   - C:\nvm\v20.19.2\node.exe
    echo   - %USERPROFILE%\AppData\Roaming\nvm\v20.19.2\node.exe
    echo.
    echo Por favor verifica que nvm esté instalado y Node 20.19.2 esté disponible
    pause
    exit /b 1
)

if not exist "%NODE_EXE%" (
    echo ERROR: Node.js 20.19.2 no encontrado en %NODE_PATH%
    echo.
    echo Por favor verifica que nvm esté instalado correctamente
    pause
    exit /b 1
)

echo [2/3] Node.js encontrado: %NODE_EXE%
echo.

REM Verificar que node_modules existe
if not exist "node_modules" (
    echo ERROR: node_modules no existe
    echo.
    echo Por favor ejecuta primero: npm install
    pause
    exit /b 1
)

echo [3/3] Iniciando servidor en puerto 3006...
echo.
echo ========================================
echo Servidor disponible en: http://localhost:3006
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

REM Ejecutar Next.js directamente
REM next.cmd es un script de Windows, ejecutarlo directamente
if exist ".\node_modules\.bin\next.cmd" (
    call ".\node_modules\.bin\next.cmd" dev --turbo -p 3006
) else if exist ".\node_modules\next\dist\bin\next" (
    "%NODE_EXE%" ".\node_modules\next\dist\bin\next" dev --turbo -p 3006
) else if exist ".\node_modules\.bin\next" (
    "%NODE_EXE%" ".\node_modules\.bin\next" dev --turbo -p 3006
) else (
    echo ERROR: Next.js no encontrado en node_modules
    echo.
    echo Por favor ejecuta: npm install
    pause
    exit /b 1
)

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo iniciar el servidor
    echo.
    pause
    exit /b 1
)

