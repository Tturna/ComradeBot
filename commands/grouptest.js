const { SlashCommandBuilder } = require('discord.js');
const { groupmeme } = require('../groupmeme.js');

// use the node module.exports thing so we can require these elsewhere.
// to use ES modules instead, we'd have to mark this app as a module(?)
// Allegedly, to access the client instance in a command file,
// you can use interaction.client
module.exports = {
    data: new SlashCommandBuilder()
        .setName('grouptest')
        .setDescription('test')
        .addIntegerOption(option => 
            option.setName('betamount')
                .setDescription('Bet Amount')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.member.user.username != 'tturna') return;
        await groupmeme(interaction);
    }
}