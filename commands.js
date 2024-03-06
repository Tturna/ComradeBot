const fs = require('node:fs'); // native node filesystem module
const path = require('node:path'); // native node path utility module
const { Collection } = require('discord.js');
const { DateTime } = require('luxon');

const setupCommands = (client) => {
  // Collection extends the JS Map
  client.commands = new Collection();
  client.cooldowns = new Collection();
  const commandsPath = path.join(__dirname, 'commands');
  // readdirSync gets an array of files in a directory
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  commandFiles.map(cf => {
    const cfPath = path.join(commandsPath, cf);
    const command = require(cfPath);

    if (!('data' in command) || !('execute' in command)) {
      console.warn(`[WARNING] The command at ${cfPath} is missing a required "data" or "execute" property.`);
      return;
    }

    client.commands.set(command.data.name, command);
  });
};

const handleSlashCommands = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  // console.log(interaction);
  // console.log(`Slash command activated.`);

  // Get the command from the bot's (client) command list
  const command = interaction.client.commands.get(interaction.commandName);

  // 'cooldowns' is a collection of commands and other collections that keep track of
  // user specific cooldowns
  const { cooldowns } = interaction.client;
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = DateTime.now().toUnixInteger();
  const commandCooldowns = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration);

  if (commandCooldowns.has(interaction.user.id)) {
    const expirationTime = commandCooldowns.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime);
      return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
    } else {
      commandCooldowns.delete(interaction.user.id);
    }
  }

  commandCooldowns.set(interaction.user.id, now);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};

module.exports = { setupCommands, handleSlashCommands };
