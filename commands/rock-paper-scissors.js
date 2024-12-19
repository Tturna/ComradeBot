const { SlashCommandBuilder } = require('discord.js');
const { rockPaperScissors } = require('../handlers/rockPaperScissorsHandler');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
  data: new SlashCommandBuilder()
    .setName('rock-paper-scissors')
    .setDescription('Start a game of rock-paper-scissors.'),
    //.addMentionableOption(option =>
    //  option.setName('targetuser')
    //    .setDescription('Specific user to challenge')
    //    .setRequired(false)),

  async execute(interaction) {
    rockPaperScissors(interaction);
  }
};
