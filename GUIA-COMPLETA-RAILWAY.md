# 🔧 CONFIGURACIÓN PASO A PASO

## PARTE 1: CONFIGURAR LOCALMENTE (Hazlo primero para probar)

### Paso 1: Obtener los datos del Bot de Discord

1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación (o crea una nueva)
3. Ve a la pestaña **"Bot"**
4. Copia el **TOKEN** (haz clic en "Reset Token" si es necesario)
5. Ve a la pestaña **"OAuth2"** → **"General"**
6. Copia el **CLIENT ID** (Application ID)

### Paso 2: Obtener el ID del Servidor

1. Abre Discord
2. Ve a Configuración de Usuario → Avanzado
3. Activa **"Modo Desarrollador"**
4. Haz clic derecho en tu servidor → **"Copiar ID"**
5. Ese es tu **GUILD_ID**

### Paso 3: Preparar los archivos

En tu carpeta del bot:

```bash
# 1. Renombrar archivos
mv bot-FINAL-LISTO.js bot.js
mv env.CONFIGURADO .env
mv talleres_config.CONFIGURADO.json talleres_config.json

# 2. Si usas FiveM, crea el resource
mkdir -p fivem-resources/registro-discord
```

### Paso 4: Editar el archivo .env

Abre `.env` con tu editor favorito y completa:

```env
# CONFIGURACIÓN DEL BOT
TOKEN=TU_TOKEN_AQUI                    # ← Pega el token del bot
CLIENT_ID=TU_CLIENT_ID_AQUI            # ← Pega el client ID
GUILD_ID=TU_GUILD_ID_AQUI              # ← Pega el ID del servidor

# WEBHOOK (Cambia este secreto por algo único y seguro)
WEBHOOK_PORT=3000
WEBHOOK_SECRET=MiClaveSecretaSuperSegura2024!@#

# ✅ TODO LO DEMÁS YA ESTÁ CONFIGURADO
# No toques el resto a menos que necesites cambiar algo
```

**IMPORTANTE:** 
- Cambia `WEBHOOK_SECRET` por algo único
- Guarda este secreto, lo necesitarás para FiveM

### Paso 5: Instalar dependencias

```bash
npm install
```

Esto instalará:
- discord.js
- dotenv  
- express

### Paso 6: Probar el bot localmente

```bash
node bot.js
```

Deberías ver:

```
🤖 Bot conectado como TuBot#1234
🌐 Webhook servidor escuchando en puerto 3000
📡 Endpoint: http://localhost:3000/api/registrar-jugador
📊 Negocios configurados:
   🍔 Burger Shot
   🐱 Cat Cafe
   🔧 Cruisin Mechanic
   🔧 SRT Motor
   🔧 Los Santos Customs
✅ Comandos registrados
```

### Paso 7: Probar en Discord

1. Ve a Discord, canal de Burger Shot
2. Usa el comando: `/entrar`
3. Deberías ver: **🟢 ENTRADA REGISTRADA - BURGER SHOT**
4. Usa el comando: `/salir`
5. Revisa el canal de logs, debería aparecer el log detallado

✅ **Si funciona, continúa a la PARTE 2**

---

## PARTE 2: SUBIR A RAILWAY (24/7)

### ¿Qué es Railway?
Railway es una plataforma que mantiene tu bot corriendo 24/7 gratis (con límites).

### Paso 1: Crear cuenta en Railway

1. Ve a https://railway.app
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con GitHub

### Paso 2: Preparar el proyecto

Crea un archivo `.gitignore` en tu carpeta:

```
node_modules/
.env
data.json
jugadores.json
talleres_config.json
*.log
```

Crea un archivo `Procfile` (sin extensión):

```
web: node bot.js
```

### Paso 3: Subir a GitHub

```bash
# Si no tienes git instalado, descárgalo de git-scm.com

# Inicializar repositorio
git init
git add .
git commit -m "Bot de ponche configurado"

# Crear repositorio en GitHub
# Ve a github.com → New Repository → Nombra tu repo

# Conectar y subir
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### Paso 4: Conectar Railway con GitHub

1. En Railway, haz clic en **"Deploy from GitHub repo"**
2. Selecciona tu repositorio
3. Railway detectará automáticamente que es un proyecto Node.js

### Paso 5: Configurar Variables de Entorno

En Railway:

1. Ve a tu proyecto → **"Variables"**
2. Haz clic en **"+ New Variable"**
3. Añade una por una:

```
TOKEN = tu_token_del_bot
CLIENT_ID = tu_client_id
GUILD_ID = tu_guild_id
WEBHOOK_PORT = 3000
WEBHOOK_SECRET = MiClaveSecretaSuperSegura2024!@#

# Y TODAS las demás del archivo .env:
BURGER_LOG_CHANNEL_ID = 1465925978361565373
BURGER_ROLE_IDS = 1460848620512219261,1465930174448144587
CATCAFE_LOG_CHANNEL_ID = 1465926065817129135
CATCAFE_ROLE_IDS = 1460848622227689649,1465929948769554604
TALLER1_LOG_CHANNEL_ID = 1465926162294243370
TALLER1_ROLE_IDS = 1460848631304163434,1460848631920852992,1460848632612913347,1460848640602931313,1460848641538527302
TALLER2_LOG_CHANNEL_ID = 1465926471804653692
TALLER2_ROLE_IDS = 1460848626862522630,1460848627730612420,1460848628364087389,1460848630121627788,1460848630750511191
TALLER3_LOG_CHANNEL_ID = 1465927387534459198
TALLER3_ROLE_IDS = 1460848623070875711,1460848623674982411,1460848624153006163,1460848625012707474,1460848625830854761
```

### Paso 6: Deploy

1. Railway hará el deploy automáticamente
2. Espera unos minutos
3. Ve a **"Deployments"** → Verás los logs
4. Si todo está bien, verás: **"Bot conectado como..."**

### Paso 7: Obtener la URL pública

1. En Railway, ve a **"Settings"**
2. En **"Networking"**, haz clic en **"Generate Domain"**
3. Te dará una URL como: `tu-proyecto.up.railway.app`

**IMPORTANTE:** Guarda esta URL para FiveM

---

## PARTE 3: CONFIGURAR FIVEM (Opcional)

### Paso 1: Crear el resource

En tu servidor FiveM:

```
resources/
└── registro-discord/
    ├── fxmanifest.lua
    └── server.lua
```

### Paso 2: fxmanifest.lua

```lua
fx_version 'cerulean'
game 'gta5'

author 'Tu Servidor'
description 'Registro automático de identificadores'
version '1.0.0'

server_scripts {
    'server.lua'
}
```

### Paso 3: server.lua

Copia el contenido de `fivem-CONFIGURADO.lua` pero **CAMBIA LA URL**:

```lua
local CONFIG = {
    -- Si el bot está en Railway:
    webhook_url = "https://tu-proyecto.up.railway.app/api/registrar-jugador",
    
    -- Si el bot está en el mismo servidor que FiveM:
    -- webhook_url = "http://127.0.0.1:3000/api/registrar-jugador",
    
    webhook_secret = "MiClaveSecretaSuperSegura2024!@#", -- DEBE SER IDÉNTICO al .env
    discord_required = true
}
```

### Paso 4: Iniciar el resource

En `server.cfg`:

```cfg
ensure registro-discord
```

O en consola:

```
ensure registro-discord
```

---

## ✅ VERIFICACIÓN FINAL

### En Discord:

1. Ve a cualquier canal de ponche
2. `/entrar` → Debería funcionar
3. `/salir` → Debería crear el log
4. `/estadisticas` → Debería mostrar tus stats
5. `/ranking total` → Debería mostrar el ranking

### En FiveM (si lo configuraste):

1. Conéctate con Discord vinculado
2. Revisa los logs de FiveM
3. Deberías ver: `[PONCHE] ✅ Identificadores registrados para TuNombre`
4. En Discord usa `/mis_identificadores`
5. Deberían aparecer tus datos

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### El bot no se conecta en Railway

**Causa:** Variables de entorno mal configuradas

**Solución:**
1. Revisa que todas las variables estén en Railway
2. NO subas el archivo `.env` a GitHub (debe estar en .gitignore)
3. Revisa los logs en Railway → Deployments

### FiveM no puede conectar con el bot

**Causa:** URL incorrecta o puerto bloqueado

**Solución:**
- Si el bot está en Railway: Usa `https://tu-proyecto.up.railway.app/api/registrar-jugador`
- Si está en el mismo servidor: Usa `http://127.0.0.1:3000/api/registrar-jugador`
- Verifica que `WEBHOOK_SECRET` sea idéntico

### Los comandos no aparecen en Discord

**Causa:** El bot necesita permisos o tiempo para sincronizar

**Solución:**
1. Espera 5-10 minutos
2. Sal y vuelve a entrar a Discord
3. Verifica que el bot tenga permisos de "applications.commands"

---

## 💰 Costos

### Railway (Plan Gratuito):
- $5 USD de crédito gratis por mes
- Suficiente para un bot pequeño
- Si necesitas más, planes desde $5/mes

### Alternativas Gratuitas:
- **Render.com** - También gratuito
- **Heroku** - Ya no tiene plan gratuito
- **Replit** - Gratuito pero menos estable

---

## 📝 CHECKLIST FINAL

Antes de dejarlo en producción:

- [ ] Bot funciona localmente
- [ ] Todos los comandos probados
- [ ] Variables de entorno en Railway
- [ ] Bot corriendo 24/7 en Railway
- [ ] FiveM conecta correctamente (opcional)
- [ ] Logs detallados funcionando
- [ ] WEBHOOK_SECRET cambiado a algo seguro
- [ ] Backup de `data.json` configurado

---

¡Listo! Tu bot estará funcionando 24/7 🎉
