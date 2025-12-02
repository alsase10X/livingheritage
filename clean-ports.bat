@echo off
REM Script para limpiar procesos de Node en puertos comunes

echo ========================================
echo Limpiando procesos de Node
echo ========================================
echo.

REM Detener todos los procesos de Node
echo Deteniendo procesos de Node...
taskkill /F /IM node.exe >nul 2>&1

if errorlevel 1 (
    echo No se encontraron procesos de Node ejecutándose
) else (
    echo Procesos de Node detenidos
)

echo.
echo Verificando puertos comunes (3000, 3001, 3006)...
echo.

REM Verificar puerto 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Puerto 3000 en uso por proceso %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Verificar puerto 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo Puerto 3001 en uso por proceso %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Verificar puerto 3006
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3006" ^| findstr "LISTENING"') do (
    echo Puerto 3006 en uso por proceso %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================
echo Limpieza completada
echo ========================================
echo.
pause

