const { Client, Events, GatewayIntentBits } = require('discord.js');
const { setupCommands, handleSlashCommands } = require('./commands.js');
const { handlePinkChee, isChee } = require('./pinkchee.js');
const { initDb } = require('./db.js');
const { handleActivityIncome } = require('./economy.js');
const express = require('express');
require('dotenv').config();

const webapp = express();

// intents define what kind of data is sent to the bot,
// so it effectively defines the bot's functionality.
const dcClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages
    ]
});

setupCommands(dcClient);

dcClient.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    dcClient.guilds.fetch(process.env.GUILD_ID)
    .then(guild => {
        console.log(`Guild=${guild}:${guild.id}`);
        handlePinkChee(guild);

        console.log("Init db");
        initDb();
    })
    .catch(e => {
        console.log(e);
    });
});

// Listen for interactions
dcClient.on(Events.InteractionCreate, async interaction => {
    handleSlashCommands(interaction);
});

dcClient.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
    console.log(`${newPresence.member.user.username}: ${oldPresence ? oldPresence.status : 'null'} -> ${newPresence.status}`);
    console.log(`Guild: ${newPresence.guild.name}`);
    isChee(newPresence.guild, newPresence.member)
    .then(userIsChee => {
        if (userIsChee) {
            handlePinkChee(newPresence.guild);
        }
    })
    .catch(e => {
        console.log(e);
    });
});

dcClient.on(Events.MessageCreate, message => {
    handleActivityIncome(message);
});

// web
webapp.get('/', (req, res) => {
    res.send('privet');
});

webapp.listen(443, () => {
    console.log('web server running on 443');
});

dcClient.login(process.env.AUTH_TOKEN);