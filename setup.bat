@echo off
REM ========================================
REM SCRIPT DE CONFIGURACIÓN RÁPIDA (Windows)
REM ========================================

echo 🚀 Configurando el bot de ponche...
echo.

REM Paso 1: Renombrar archivos
echo 📁 Renombrando archivos...
if exist bot-FINAL-LISTO.js (
    ren bot-FINAL-LISTO.js bot.js
)
if exist env.CONFIGURADO (
    ren env.CONFIGURADO .env
)
if exist talleres_config.CONFIGURADO.json (
    ren talleres_config.CONFIGURADO.json talleres_config.json
)

echo ✅ Archivos renombrados
echo.

REM Paso 2: Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo =========================================
echo ✅ CONFIGURACIÓN COMPLETADA
echo =========================================
echo.
echo PRÓXIMOS PASOS:
echo.
echo 1. Edita el archivo .env y completa:
echo    - TOKEN=tu_token_aqui
echo    - CLIENT_ID=tu_client_id
echo    - GUILD_ID=tu_guild_id
echo    - WEBHOOK_SECRET=cambiaesto
echo.
echo 2. Para iniciar el bot:
echo    node bot.js
echo.
echo 3. Para subirlo a Railway:
echo    - Lee GUIA-COMPLETA-RAILWAY.md
echo.
echo =========================================
pause
