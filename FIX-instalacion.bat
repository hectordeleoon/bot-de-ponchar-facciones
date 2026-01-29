@echo off
REM ========================================
REM SOLUCIÓN RÁPIDA - ERROR DE INSTALACIÓN
REM ========================================

echo.
echo ­ƒöº SOLUCIONANDO ERROR DE INSTALACIÓN...
echo.
echo El error que viste es porque @discordjs/opus necesita Python,
echo pero NO LO NECESITAS para este bot (no usa voz).
echo.
echo ­ƒôª Limpiando instalación anterior...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo ­ƒôª Usando package.json simplificado (sin dependencias de voz)...
copy package-SIMPLE.json package.json

echo.
echo ­ƒôª Instalando solo las dependencias necesarias...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo Ô£à ¡INSTALACIÓN EXITOSA!
    echo =========================================
    echo.
    echo ­ƒÆë PRÓXIMOS PASOS:
    echo.
    echo 1. Edita el archivo .env:
    echo    - Abre .env con un editor de texto
    echo    - Completa TOKEN, CLIENT_ID y GUILD_ID
    echo    - Cambia WEBHOOK_SECRET por algo seguro
    echo.
    echo 2. Para iniciar el bot:
    echo    node bot.js
    echo.
    echo 3. Si funciona bien, súbelo a Railway
    echo.
    echo =========================================
) else (
    echo.
    echo ÔØî ERROR: La instalación falló
    echo.
    echo SOLUCIÓN:
    echo 1. Cierra cualquier programa que pueda estar usando node_modules
    echo 2. Ejecuta este script de nuevo
    echo 3. Si sigue fallando, reinicia tu PC
    echo.
)

pause
