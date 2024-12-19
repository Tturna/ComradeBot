const { SlashCommandBuilder } = require('discord.js');
const { rpsStreaks } = require('../handlers/rockPaperScissorsHandler');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps-streaks')
    .setDescription('See your current rock-paper-scissors streaks.')
    .addBooleanOption(option =>
      option.setName('hidden')
        .setDescription('Whether to hide your streaks.')),

  async execute(interaction) {
    rpsStreaks(interaction);
  }
};
