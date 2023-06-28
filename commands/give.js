const { SlashCommandBuilder } = require('discord.js');
const { giveBits } = require('../economy.js');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give bits ★ to someone.')
        .addMentionableOption(option =>
            option.setName('targetuser')
                .setDescription('User to give bits to')
                .setRequired(true))
        
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of bits to give')
                .setRequired(true)
                .setMinValue(5)),

    async execute(interaction) {
        await giveBits(interaction);
    }
}