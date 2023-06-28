const { SlashCommandBuilder } = require('discord.js');
const { roulette } = require('../gambling.js');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
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
                    { name: 'Green', value: 'green' }
                ))

        .addBooleanOption(option =>
            option.setName('public')
                .setDescription('Show this publicly?')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: !(interaction.options.getBoolean('public'))});
        roulette(interaction);
    }
}