const { Client, Events, GatewayIntentBits } = require('discord.js');
const { setupCommands, handleSlashCommands } = require('./commands.js');
const { handlePinkChee, isChee } = require('./pinkchee.js');
const express = require('express');
require('dotenv').config();

const HIDDEN_CHANNEL_ID = "985125620440768592";

const webapp = express();

// intents define what kind of data is sent to the bot,
// so it effectively defines the bot's functionality.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages
    ]
});

setupCommands(client);

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    client.guilds.fetch(process.env.GUILD_ID)
    .then(guild => {
        console.log(`Guild=${guild}:${guild.id}`);
        handlePinkChee(guild);
    })
    .catch(e => {
        console.log(e);
    });
});

// Listen for interactions
// Return if not slash command interaction
client.on(Events.InteractionCreate, async interaction => {
    handleSlashCommands(interaction);
});

client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
    console.log(`Presence updated for user: ${newPresence.member.user.username}`);
    console.log(`Presence changed: ${oldPresence ? oldPresence.status : 'null'} -> ${newPresence.status}`);
    console.log(`Guild: ${newPresence.guild.name}`);
    isChee(newPresence.guild, newPresence.member)
    .then(userIsChee => {
        // console.log(`User ${newPresence.member.user.username} checked against Chee.`);
        if (userIsChee) {
            // console.log("handle pink chee");
            handlePinkChee(newPresence.guild);
            console.log(`Chee presence changed from ${oldPresence.status} to ${newPresence.status}.`);
        }
    })
    .catch(e => {
        console.log(e);
    });
});

// web
webapp.get('/', (req, res) => {
    res.send('privet');
});

webapp.listen(443, () => {
    console.log('web server running on 443');
});

client.login(process.env.AUTH_TOKEN);