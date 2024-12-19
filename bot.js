const { Client, Events, GatewayIntentBits } = require('discord.js');
const { setupCommands, handleSlashCommands } = require('./handlers/commandsHandler.js');
const { handlePinkChee, isChee } = require('./handlers/pinkcheeHandler.js');
const { initDb } = require('./handlers/dbHandler.js');
const { handleActivityIncome } = require('./handlers/economyHandler.js');
const webapp = require('./webapp.js');

require('dotenv').config();

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

  const hiddenChannel = await guild.channels.fetch('985125620440768592');
  hiddenChannel.send('I\'m up!');
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

const PORT = process.env.NODE_ENV === 'test' ? process.env.TEST_PORT : process.env.PORT;

// The web app only exists for health checks, which keeps the Render instance alive
webapp.listen(PORT, () => {
  console.log(`web server running on ${PORT}`);
});

dcClient.login(process.env.AUTH_TOKEN);
