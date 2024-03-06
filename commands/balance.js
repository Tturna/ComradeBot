const { SlashCommandBuilder } = require('discord.js');
const { addUser, userExists, getUserData } = require('../db.js');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Shows your balance.')
    .addBooleanOption(option =>
      option.setName('hidden')
        .setDescription('Hides your balance')),

  async execute(interaction) {
    const username = interaction.member.user.username;
    if (!(await userExists(username))) {
      await addUser(username);
      console.log(`Added user ${username} to DB`);
      await interaction.reply({
        content: 'You have 0 Bits ★',
        ephemeral: interaction.options.getBoolean('hidden')
      });
      return;
    }

    const data = await getUserData(username, 'balance');
    await interaction.reply({
      content: `You have ${data.balance} Bits ★`,
      ephemeral: interaction.options.getBoolean('hidden')
    });
  }
};
