const { SlashCommandBuilder } = require('discord.js');
const { pinkChance } = require('../pinkchee');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pinkchance')
        .setDescription('Returns the chance for chee to be pink tomorrow (New York time)'),

    async execute(interaction) {
        await interaction.reply(`There is a ${pinkChance().toString()}% chance that chee will be pink tomorrow`);
    }
}