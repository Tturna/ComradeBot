const { SlashCommandBuilder } = require('discord.js');
const { rpsLeaderboard } = require('../handlers/rockPaperScissorsHandler');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps-leaderboard')
    .setDescription('See the rock-paper-scissors streaks leaderboard.')
    .addBooleanOption(option =>
      option.setName('hidden')
        .setDescription('Whether to hide the leaderboard.')),

  async execute(interaction) {
    rpsLeaderboard(interaction);
  }
};
