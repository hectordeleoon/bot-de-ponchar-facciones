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

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

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

const RANGOS = {
  policia: [
    { nombre: "Cadete", horas: 15 },
    { nombre: "Cabo", horas: 20 },
    { nombre: "Instructor Cabo", horas: 25 },
    { nombre: "Sargento", horas: 30 },
    { nombre: "Teniente", horas: 35 },
    { nombre: "Capitán", horas: 40 },
    { nombre: "Mayor", horas: 45 },
    { nombre: "Coronel", horas: 50 },
    { nombre: "General", horas: null },
    { nombre: "Asuntos Internos", horas: null }
  ],
  ems: [
    { nombre: "Rookie", horas: 15 },
    { nombre: "Est. Médico", horas: 20 },
    { nombre: "Enfermero/a", horas: 25 },
    { nombre: "Residente", horas: 30 },
    { nombre: "Asist. Doctor", horas: 35 },
    { nombre: "Especialista", horas: 40 },
    { nombre: "Supervisor", horas: 45 },
    { nombre: "Sub Director", horas: 50 },
    { nombre: "Director", horas: null }
  ]
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

let data = {};
const DATA_FILE = "data.json";
let guardarPendiente = false;

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      console.log("✅ Datos cargados correctamente");
    }
  } catch (error) {
    console.error("❌ Error cargando datos:", error);
    data = {};
  }
}

function save() {
  guardarPendiente = true;
}

setInterval(() => {
  if (guardarPendiente) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
      guardarPendiente = false;
    } catch (error) {
      console.error("❌ Error guardando datos:", error);
    }
  }
}, 5000);

loadData();

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
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
}

function detectarDepartamento(interaction) {
  const channelId = interaction.channelId;
  const memberRoles = interaction.member.roles.cache;
  
  // Verificar Policía
  if (channelId === POLICIA_CHANNEL_ID && memberRoles.has(POLICIA_ROLE_ID)) {
    return { tipo: "policia", nombre: "POLICÍA", color: 0x0066cc };
  }
  
  // Verificar EMS
  if (channelId === EMS_CHANNEL_ID && memberRoles.has(EMS_ROLE_ID)) {
    return { tipo: "ems", nombre: "EMS", color: 0xff0000 };
  }
  
  // Verificar Negocios
  for (const [key, negocio] of Object.entries(NEGOCIOS)) {
    if (channelId === negocio.channelId) {
      const tieneRol = negocio.roleIds.some(roleId => memberRoles.has(roleId));
      if (tieneRol) {
        return { tipo: key, nombre: negocio.nombre, color: 0x00ff00, emoji: negocio.emoji };
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
      rango: departamento === "policia" ? "Cadete" : (departamento === "ems" ? "Rookie" : "Empleado"),
      penalizaciones: 0,
      strikes: 0,
      suspendidoHasta: null,
      tops: 0,
      entrada: null,
      ultimaEvaluacion: Date.now()
    };
  }
  return data[key];
}

function formatearTiempo(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

client.once("clientReady", async () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
  await registrarComandos();
  iniciarTareasProgramadas();
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

  if (interaction.commandName === "entrar") {
    if (usuario.suspendidoHasta && now < usuario.suspendidoHasta) {
      const fechaFin = new Date(usuario.suspendidoHasta).toLocaleString("es-ES");
      return interaction.reply({
        content: `⛔ Estás suspendido hasta el **${fechaFin}**`,
        ephemeral: true
      });
    }

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
      .addFields({ name: "⏰ Hora", value: new Date(now).toLocaleString("es-ES") })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "salir") {
    if (!usuario.entrada) {
      return interaction.reply({
        content: "❌ No has marcado entrada previamente",
        ephemeral: true
      });
    }

    const tiempo = now - usuario.entrada;
    const tiempoFormateado = formatearTiempo(tiempo);

    usuario.total += tiempo;
    usuario.daily += tiempo;
    usuario.weekly += tiempo;
    usuario.monthly += tiempo;
    delete usuario.entrada;
    save();

    // Obtener canal de logs
    let logChannelId;
    if (departamento.tipo === "policia") {
      logChannelId = POLICIA_LOG_CHANNEL_ID;
    } else if (departamento.tipo === "ems") {
      logChannelId = EMS_LOG_CHANNEL_ID;
    } else {
      logChannelId = NEGOCIOS[departamento.tipo].logChannelId;
    }
    
    try {
      const logChannel = await client.channels.fetch(logChannelId);
      logChannel.send(`🧾 **[${nombreDep}]** ${interaction.user.username} trabajó **${tiempoFormateado}**`);
    } catch (error) {
      console.error("❌ Error enviando log:", error);
    }

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

  if (interaction.commandName === "estadisticas") {
    const embed = new EmbedBuilder()
      .setColor(colorDep)
      .setTitle(`📊 Estadísticas de ${interaction.user.username} - ${nombreDep}`)
      .addFields(
        { name: "🎖️ Rango", value: usuario.rango, inline: true },
        { name: "⚠️ Strikes", value: `${usuario.strikes}/3`, inline: true },
        { name: "🏆 Top conseguidos", value: `${usuario.tops}`, inline: true },
        { name: "📅 Hoy", value: formatearTiempo(usuario.daily), inline: true },
        { name: "📅 Esta semana", value: formatearTiempo(usuario.weekly), inline: true },
        { name: "📅 Este mes", value: formatearTiempo(usuario.monthly), inline: true },
        { name: "🕐 Total acumulado", value: formatearTiempo(usuario.total), inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

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
        value: `<@${usuario.userId}> — **${formatearTiempo(usuario[periodo])}** | ${usuario.rango}`,
        inline: false
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

let ultimaVerificacionHora = -1;
let ultimaVerificacionDia = -1;

function iniciarTareasProgramadas() {
  setInterval(verificarSalidasAutomaticas, 60000);
  setInterval(verificarTareasHorarias, 60000);
}

async function verificarSalidasAutomaticas() {
  const now = Date.now();
  const LIMITE_24H = 86400000;

  for (const key in data) {
    const usuario = data[key];
    
    if (usuario.entrada && now - usuario.entrada >= LIMITE_24H) {
      usuario.total += LIMITE_24H;
      usuario.weekly += LIMITE_24H;
      usuario.monthly += LIMITE_24H;
      usuario.strikes += 1;
      delete usuario.entrada;

      if (usuario.strikes >= 3) {
        usuario.suspendidoHasta = now + 48 * 60 * 60 * 1000;
        usuario.strikes = 0;
      }

      save();
    }
  }
}

async function verificarTareasHorarias() {
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const diaActual = ahora.getDate();

  if (ultimaVerificacionHora === horaActual && ultimaVerificacionDia === diaActual) {
    return;
  }

  ultimaVerificacionHora = horaActual;
  ultimaVerificacionDia = diaActual;

  if (horaActual === 23) {
    resetearDailyStats();
  }

  if (ahora.getDay() === 0 && horaActual === 23) {
    resetearWeeklyStats();
  }

  if (diaActual === 1 && horaActual === 0) {
    resetearMonthlyStats();
  }
}

function resetearDailyStats() {
  for (const key in data) {
    data[key].daily = 0;
  }
  save();
}

function resetearWeeklyStats() {
  for (const key in data) {
    data[key].weekly = 0;
    data[key].penalizaciones = 0;
  }
  save();
}

function resetearMonthlyStats() {
  for (const key in data) {
    data[key].monthly = 0;
    data[key].strikes = 0;
    data[key].tops = 0;
  }
  save();
}

process.on('SIGINT', () => {
  console.log('⏸️ Guardando datos antes de cerrar...');
  if (guardarPendiente) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  }
  process.exit(0);
});

client.on("error", error => {
  console.error("❌ Error del cliente:", error);
});

process.on("unhandledRejection", error => {
  console.error("❌ Promesa rechazada:", error);
});

client.login(TOKEN).catch(error => {
  console.error("❌ Error al iniciar sesión:", error);
  process.exit(1);
});