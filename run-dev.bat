@echo off
REM Script para ejecutar el servidor de desarrollo
REM Este script cambia a Node 20.19.2 y ejecuta pnpm dev

echo Cambiando a Node.js 20.19.2...
call nvm use 20.19.2

if errorlevel 1 (
    echo ERROR: No se pudo cambiar a Node.js 20.19.2
    echo Por favor asegurate de que nvm esté instalado y Node 20.19.2 esté disponible
    pause
    exit /b 1
)

echo.
echo Esperando 2 segundos para que nvm actualice el PATH...
timeout /t 2 /nobreak >nul

REM Refrescar PATH después de nvm use
REM Intentar diferentes ubicaciones comunes de nvm
if exist "C:\nvm\v20.19.2" (
    set "NVM_PATH=C:\nvm"
    set "NODE_PATH=%NVM_PATH%\v20.19.2"
    set "PATH=%NODE_PATH%;%PATH%"
) else if exist "%USERPROFILE%\AppData\Roaming\nvm\v20.19.2" (
    set "NVM_PATH=%USERPROFILE%\AppData\Roaming\nvm"
    set "NODE_PATH=%NVM_PATH%\v20.19.2"
    set "PATH=%NODE_PATH%;%PATH%"
) else (
    set "NVM_PATH=C:\nvm"
    set "NODE_PATH=%NVM_PATH%\v20.19.2"
    set "PATH=%NODE_PATH%;%PATH%"
)

echo.
echo Iniciando servidor de desarrollo en puerto 3006...
echo.

REM Intentar usar pnpm desde node_modules local primero
if exist "node_modules\.bin\pnpm.cmd" (
    echo Usando pnpm desde node_modules...
    call node_modules\.bin\pnpm.cmd dev
) else if exist "node_modules\.bin\pnpm" (
    echo Usando pnpm desde node_modules (sin .cmd)...
    call node_modules\.bin\pnpm dev
) else (
    echo pnpm no encontrado en node_modules, usando npx...
    call npx --yes pnpm dev
)

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo ejecutar pnpm
    echo Por favor asegurate de que las dependencias estén instaladas: pnpm install
    pause
    exit /b 1
)


pause

