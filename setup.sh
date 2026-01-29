#!/bin/bash

# ========================================
# SCRIPT DE CONFIGURACIÓN RÁPIDA
# ========================================

echo "🚀 Configurando el bot de ponche..."
echo ""

# Paso 1: Renombrar archivos
echo "📁 Renombrando archivos..."
mv bot-FINAL-LISTO.js bot.js 2>/dev/null
mv env.CONFIGURADO .env 2>/dev/null
mv talleres_config.CONFIGURADO.json talleres_config.json 2>/dev/null

# Paso 2: Verificar que existe .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "Por favor, asegúrate de tener env.CONFIGURADO en la carpeta"
    exit 1
fi

echo "✅ Archivos renombrados"
echo ""

# Paso 3: Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "PRÓXIMOS PASOS:"
echo ""
echo "1. Edita el archivo .env y completa:"
echo "   - TOKEN=tu_token_aqui"
echo "   - CLIENT_ID=tu_client_id"
echo "   - GUILD_ID=tu_guild_id"
echo "   - WEBHOOK_SECRET=cambiaesto"
echo ""
echo "2. Para iniciar el bot:"
echo "   node bot.js"
echo ""
echo "3. Para subirlo a Railway:"
echo "   - Lee GUIA-COMPLETA-RAILWAY.md"
echo ""
echo "========================================="
