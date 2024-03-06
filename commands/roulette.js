const { SlashCommandBuilder } = require('discord.js');
const { roulette } = require('../gambling.js');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Play roulette')
    .addIntegerOption(option =>
      option.setName('betamount')
        .setDescription('Bet amount')
        .setRequired(true)
        .setMinValue(5))

    .addStringOption(option =>
      option.setName('betcolor')
        .setDescription('Which color will win?')
        .setRequired(true)
        .addChoices(
          { name: 'Red', value: 'red' },
          { name: 'Yellow', value: 'yellow' },
          { name: 'Blue', value: 'blue' },
          { name: 'Green', value: 'green' }
        ))

    .addBooleanOption(option =>
      option.setName('hidden')
        .setDescription('Hide your game?')),

  async execute(interaction) {
    roulette(interaction);
  }
};
