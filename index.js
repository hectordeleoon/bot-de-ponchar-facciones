require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const express = require("express");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Configuración del servidor webhook para FiveM
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "cambia_este_secreto";

// CONFIGURACIÓN POLICÍA
const POLICIA_CHANNEL_ID = process.env.POLICIA_CHANNEL_ID;
const POLICIA_LOG_CHANNEL_ID = process.env.POLICIA_LOG_CHANNEL_ID;
const POLICIA_ROLE_ID = process.env.POLICIA_ROLE_ID;

// CONFIGURACIÓN EMS
const EMS_CHANNEL_ID = process.env.EMS_CHANNEL_ID;
const EMS_LOG_CHANNEL_ID = process.env.EMS_LOG_CHANNEL_ID;
const EMS_ROLE_ID = process.env.EMS_ROLE_ID;

// CONFIGURACIÓN NEGOCIOS
const NEGOCIOS = {
  burger: {
    channelId: "1460848871096844351",
    logChannelId: process.env.BURGER_LOG_CHANNEL_ID,
    roleIds: process.env.BURGER_ROLE_IDS?.split(',') || [],
    nombre: "BURGER SHOT",
    emoji: "🍔"
  },
  catcafe: {
    channelId: "1460848936095842304",
    logChannelId: process.env.CATCAFE_LOG_CHANNEL_ID,
    roleIds: process.env.CATCAFE_ROLE_IDS?.split(',') || [],
    nombre: "CAT CAFE",
    emoji: "🐱"
  },
  taller1: {
    channelId: "1460849062155911331",
    logChannelId: process.env.TALLER1_LOG_CHANNEL_ID,
    roleIds: process.env.TALLER1_ROLE_IDS?.split(',') || [],
    nombre: "CRUISIN MECHANIC",
    emoji: "🔧"
  },
  taller2: {
    channelId: "1460849005733875785",
    logChannelId: process.env.TALLER2_LOG_CHANNEL_ID,
    roleIds: process.env.TALLER2_ROLE_IDS?.split(',') || [],
    nombre: "SRT MOTOR",
    emoji: "🔧"
  },
  taller3: {
    channelId: "1460849121786069084",
    logChannelId: process.env.TALLER3_LOG_CHANNEL_ID,
    roleIds: process.env.TALLER3_ROLE_IDS?.split(',') || [],
    nombre: "LOS SANTOS CUSTOMS",
    emoji: "🔧"
  }
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

let data = {};
let jugadoresData = {}; // Almacena los identificadores de FiveM
const DATA_FILE = "data.json";
const JUGADORES_FILE = "jugadores.json";
let guardarPendiente = false;

// ========================================
// FUNCIONES DE CARGA Y GUARDADO
// ========================================
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      console.log("✅ Datos de ponche cargados");
    }
    if (fs.existsSync(JUGADORES_FILE)) {
      jugadoresData = JSON.parse(fs.readFileSync(JUGADORES_FILE, "utf8"));
      console.log("✅ Datos de jugadores cargados");
    }
  } catch (error) {
    console.error("❌ Error cargando datos:", error);
    data = {};
    jugadoresData = {};
  }
}

function save() {
  guardarPendiente = true;
}

setInterval(() => {
  if (guardarPendiente) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
      fs.writeFileSync(JUGADORES_FILE, JSON.stringify(jugadoresData, null, 2), "utf8");
      guardarPendiente = false;
    } catch (error) {
      console.error("❌ Error guardando datos:", error);
    }
  }
}, 5000);

loadData();

// ========================================
// SERVIDOR WEBHOOK PARA FIVEM
// ========================================
const app = express();
app.use(express.json());

// Endpoint para registrar jugadores desde FiveM
app.post('/register-player', (req, res) => {
  const { secret, discordId, identifiers, playerName, playerId } = req.body;
  
  // Verificar secreto
  if (secret !== WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Secreto inválido' });
  }

  if (!discordId || !identifiers) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Guardar información del jugador
  jugadoresData[discordId] = {
    playerId: playerId || 'N/A',
    playerName: playerName || 'Desconocido',
    identifiers: identifiers,
    lastUpdate: new Date().toISOString()
  };

  save();
  
  console.log(`✅ Jugador registrado: ${playerName} (${discordId})`);
  res.json({ success: true, message: 'Jugador registrado correctamente' });
});

// Iniciar servidor webhook
app.listen(WEBHOOK_PORT, () => {
  console.log(`🌐 Servidor webhook escuchando en puerto ${WEBHOOK_PORT}`);
});

// ========================================
// COMANDOS SLASH
// ========================================
const commands = [
  new SlashCommandBuilder()
    .setName("entrar")
    .setDescription("Marcar entrada al servicio"),
  new SlashCommandBuilder()
    .setName("salir")
    .setDescription("Marcar salida del servicio"),
  new SlashCommandBuilder()
    .setName("estadisticas")
    .setDescription("Ver tus estadísticas personales"),
  new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Ver el ranking actual")
    .addStringOption(option =>
      option.setName("periodo")
        .setDescription("Periodo del ranking")
        .setRequired(true)
        .addChoices(
          { name: "Hoy", value: "daily" },
          { name: "Esta semana", value: "weekly" },
          { name: "Este mes", value: "monthly" },
          { name: "Total", value: "total" }
        )
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registrarComandos() {
  try {
    console.log("🔄 Registrando comandos slash...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos slash registrados exitosamente");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================
function detectarDepartamento(interaction) {
  const channelId = interaction.channelId;
  const memberRoles = interaction.member.roles.cache;
  
  // Verificar Policía
  if (channelId === POLICIA_CHANNEL_ID && memberRoles.has(POLICIA_ROLE_ID)) {
    return { tipo: "policia", nombre: "POLICÍA", color: 0x0066cc, logChannelId: POLICIA_LOG_CHANNEL_ID };
  }
  
  // Verificar EMS
  if (channelId === EMS_CHANNEL_ID && memberRoles.has(EMS_ROLE_ID)) {
    return { tipo: "ems", nombre: "EMS", color: 0xff0000, logChannelId: EMS_LOG_CHANNEL_ID };
  }
  
  // Verificar Negocios
  for (const [key, negocio] of Object.entries(NEGOCIOS)) {
    if (channelId === negocio.channelId) {
      const tieneRol = negocio.roleIds.some(roleId => memberRoles.has(roleId));
      if (tieneRol) {
        return { 
          tipo: key, 
          nombre: negocio.nombre, 
          color: 0x00ff00, 
          emoji: negocio.emoji,
          logChannelId: negocio.logChannelId
        };
      }
    }
  }
  
  return null;
}

function inicializarUsuario(id, departamento) {
  const key = `${id}_${departamento}`;
  if (!data[key]) {
    data[key] = {
      userId: id,
      departamento: departamento,
      total: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      entrada: null,
      entradas: []
    };
  }
  return data[key];
}

function formatearTiempo(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatearFecha(timestamp) {
  const fecha = new Date(timestamp);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${año} - ${hora}:${minutos}`;
}

// ========================================
// EVENTOS DEL BOT
// ========================================
client.once("ready", async () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
  await registrarComandos();
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const departamento = detectarDepartamento(interaction);
  
  if (!departamento) {
    return interaction.reply({
      content: "❌ Debes usar este comando en el canal correcto con el rol adecuado",
      ephemeral: true
    });
  }

  const id = interaction.user.id;
  const now = Date.now();
  const usuario = inicializarUsuario(id, departamento.tipo);
  
  const nombreDep = departamento.nombre;
  const colorDep = departamento.color;

  // ========================================
  // COMANDO /entrar
  // ========================================
  if (interaction.commandName === "entrar") {
    if (usuario.entrada) {
      const tiempoActual = now - usuario.entrada;
      return interaction.reply({
        content: `⚠️ Ya tienes una entrada activa desde hace **${formatearTiempo(tiempoActual)}**`,
        ephemeral: true
      });
    }

    usuario.entrada = now;
    save();

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`🟢 ENTRADA REGISTRADA - ${nombreDep}`)
      .setDescription(`**${interaction.user.username}** entró a trabajar`)
      .addFields({ name: "⏰ Hora", value: formatearFecha(now) })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ========================================
  // COMANDO /salir
  // ========================================
  if (interaction.commandName === "salir") {
    if (!usuario.entrada) {
      return interaction.reply({
        content: "❌ No has marcado entrada previamente",
        ephemeral: true
      });
    }

    const horaEntrada = usuario.entrada;
    const horaSalida = now;
    const tiempo = horaSalida - horaEntrada;
    const tiempoMinutos = Math.floor(tiempo / 60000);
    const tiempoFormateado = formatearTiempo(tiempo);

    // Actualizar estadísticas
    usuario.total += tiempo;
    usuario.daily += tiempo;
    usuario.weekly += tiempo;
    usuario.monthly += tiempo;
    
    // Guardar en historial
    usuario.entradas.push({
      entrada: horaEntrada,
      salida: horaSalida,
      duracion: tiempo
    });
    
    delete usuario.entrada;
    save();

    // Obtener información del jugador de FiveM
    const jugadorInfo = jugadoresData[id] || null;

    // Enviar al canal de logs
    try {
      const logChannel = await client.channels.fetch(departamento.logChannelId);
      
      // Mensaje simple primero
      await logChannel.send(`🧾 **[${nombreDep}]** ${interaction.user.username} trabajó **${tiempoFormateado}**`);
      
      // Embed detallado con identificadores
      const logEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle(`📋 Salida del servicio`)
        .setDescription(`El jugador ha finalizado el servicio.`)
        .addFields(
          { name: "⏰ Hora de entrada", value: `\`${formatearFecha(horaEntrada)}\``, inline: true },
          { name: "⏰ Hora de salida", value: `\`${formatearFecha(horaSalida)}\``, inline: true },
          { name: "⏱️ Total", value: `\`${tiempoMinutos}\` minutos`, inline: true }
        );

      // Agregar identificadores si están disponibles
      if (jugadorInfo && jugadorInfo.identifiers) {
        const ids = jugadorInfo.identifiers;
        let identificadoresTexto = `**ID:** ${jugadorInfo.playerId || 'N/A'}\n`;
        identificadoresTexto += `**Nombre:** ${jugadorInfo.playerName || 'N/A'}\n`;
        
        if (ids.license) identificadoresTexto += `**license:** ${ids.license}\n`;
        if (ids.xbl) identificadoresTexto += `**xbl:** ${ids.xbl}\n`;
        if (ids.live) identificadoresTexto += `**live:** ${ids.live}\n`;
        if (ids.discord) identificadoresTexto += `**discord:** ${ids.discord}\n`;
        
        logEmbed.addFields({ 
          name: "🆔 IDENTIFICADORES", 
          value: identificadoresTexto,
          inline: false 
        });
      }

      await logChannel.send({ embeds: [logEmbed] });
      
    } catch (error) {
      console.error("❌ Error enviando log:", error);
    }

    // Responder al usuario
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`🔴 SALIDA REGISTRADA - ${nombreDep}`)
      .addFields(
        { name: "⏱️ Tiempo trabajado", value: tiempoFormateado },
        { name: "📊 Total acumulado", value: formatearTiempo(usuario.total) }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ========================================
  // COMANDO /estadisticas
  // ========================================
  if (interaction.commandName === "estadisticas") {
    const embed = new EmbedBuilder()
      .setColor(colorDep)
      .setTitle(`📊 Estadísticas de ${interaction.user.username} - ${nombreDep}`)
      .addFields(
        { name: "📅 Hoy", value: formatearTiempo(usuario.daily), inline: true },
        { name: "📅 Esta semana", value: formatearTiempo(usuario.weekly), inline: true },
        { name: "📅 Este mes", value: formatearTiempo(usuario.monthly), inline: true },
        { name: "🕐 Total acumulado", value: formatearTiempo(usuario.total), inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ========================================
  // COMANDO /ranking
  // ========================================
  if (interaction.commandName === "ranking") {
    const periodo = interaction.options.getString("periodo");
    
    const periodoNombres = {
      daily: "📅 HOY",
      weekly: "📅 ESTA SEMANA",
      monthly: "📅 ESTE MES",
      total: "🕐 TOTAL HISTÓRICO"
    };

    const top = Object.entries(data)
      .filter(([key, u]) => u.departamento === departamento.tipo && u[periodo] > 0)
      .sort((a, b) => b[1][periodo] - a[1][periodo])
      .slice(0, 10);

    if (top.length === 0) {
      return interaction.reply({
        content: "❌ No hay datos disponibles para este periodo",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(colorDep)
      .setTitle(`🏆 RANKING ${periodoNombres[periodo]} - ${nombreDep}`)
      .setTimestamp();

    const medallas = ["🥇", "🥈", "🥉"];
    
    top.forEach(([key, usuario], i) => {
      const emoji = i < 3 ? medallas[i] : `**${i + 1}.**`;
      embed.addFields({
        name: `${emoji} ${i < 3 ? `${i + 1}° Lugar` : ''}`,
        value: `<@${usuario.userId}> — **${formatearTiempo(usuario[periodo])}**`,
        inline: false
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// ========================================
// MANEJO DE ERRORES
// ========================================
process.on('SIGINT', () => {
  console.log('⏸️ Guardando datos antes de cerrar...');
  if (guardarPendiente) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    fs.writeFileSync(JUGADORES_FILE, JSON.stringify(jugadoresData, null, 2), "utf8");
  }
  process.exit(0);
});

client.on("error", error => {
  console.error("❌ Error del cliente:", error);
});

process.on("unhandledRejection", error => {
  console.error("❌ Promesa rechazada:", error);
});

// ========================================
// INICIAR BOT
// ========================================
client.login(TOKEN).catch(error => {
  console.error("❌ Error al iniciar sesión:", error);
  process.exit(1);
});