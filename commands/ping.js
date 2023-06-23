const { SlashCommandBuilder } = require('discord.js');

// use the node module.exports thing so we can require these elsewhere
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction) {
        await interaction.reply('Pong!');
    }
}