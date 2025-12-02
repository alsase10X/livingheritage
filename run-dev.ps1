# Script para ejecutar el servidor de desarrollo
# Este script debe ejecutarse en una NUEVA terminal de PowerShell

# Cambiar a Node 20.19.2
nvm use 20.19.2

# Esperar un momento para que nvm actualice el PATH
Start-Sleep -Seconds 2

# Refrescar PATH completamente
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Intentar encontrar y usar pnpm desde node_modules local
if (Test-Path ".\node_modules\.bin\pnpm.cmd") {
    Write-Host "Usando pnpm desde node_modules..."
    & ".\node_modules\.bin\pnpm.cmd" dev
} else {
    # Intentar usar pnpm global
    Write-Host "Intentando usar pnpm global..."
    pnpm dev
}

