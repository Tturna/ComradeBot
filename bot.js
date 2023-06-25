const { Client, Events, GatewayIntentBits } = require('discord.js');
const { setupCommands, handleSlashCommands } = require('./commands.js');
const { handlePinkChee, isChee } = require('./pinkchee.js');
require('dotenv').config();

const HIDDEN_CHANNEL_ID = "985125620440768592";

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

        // Start sending messages every 10 minutes to hopefully prevent
        // Render from timing out the bot.
        guild.channels.fetch(HIDDEN_CHANNEL_ID)
        .then(hiddenChannel => {
            hiddenChannel.send(`Startup. ${new Date()}`);
        })
        .catch(e => {
            console.log(e);
        });
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

client.on(Events.MessageCreate, message => {

    // Handle periodic log messages
    // This is an experiment to see if this prevents Render's hosting timeout.
    console.log(`${message.member.user.username} sent a message.`);
    if (message.channelId != HIDDEN_CHANNEL_ID) return;
    if (message.member.id != process.env.APP_ID) return;
    console.log('Received own message in hidden channel. Sending update in 10 minutes.')

    // 10 minute delay
    setTimeout(() => {
        message.channel.send(`Periodic log message ${new Date()}`);
    }, 600_000);
});

client.login(process.env.AUTH_TOKEN);