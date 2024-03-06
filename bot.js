const { Client, Events, GatewayIntentBits } = require('discord.js');
const { setupCommands, handleSlashCommands } = require('./commands.js');
const { handlePinkChee, isChee } = require('./pinkchee.js');
const { initDb } = require('./db.js');
const { handleActivityIncome } = require('./economy.js');
const express = require('express');
require('dotenv').config();

const webapp = express();

// intents define what kind of data is sent to the bot,
// so it effectively defines the bot's functionality.
const dcClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages
  ]
});

setupCommands(dcClient);

dcClient.once(Events.ClientReady, async c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  const guild = await dcClient.guilds.fetch(process.env.GUILD_ID);

  if (!guild) {
    console.error('Guild not found?!');
    return;
  }

  console.log(`Guild=${guild}:${guild.id}`);
  await handlePinkChee(guild);
  initDb();
});

dcClient.on(Events.InteractionCreate, async interaction => {
  handleSlashCommands(interaction);
});

dcClient.on(Events.PresenceUpdate, (_oldPresence, newPresence) => {
  // console.log(`${newPresence.member.user.username}: ${oldPresence ? oldPresence.status : 'null'} -> ${newPresence.status}`);
  // console.log(`Guild: ${newPresence.guild.name}`);
  if(isChee(newPresence.member)) {
    handlePinkChee(newPresence.guild);
  }
});

dcClient.on(Events.MessageCreate, message => {
  handleActivityIncome(message);
});

// endpoint for health checks, which keep the Render instance running
webapp.get('/', (_req, res) => {
  res.send('privet');
});

webapp.listen(443, () => {
  console.log('web server running on 443');
});

dcClient.login(process.env.AUTH_TOKEN);
