const fs = require('node:fs'); // native node filesystem module
const path = require('node:path'); // native node path utility module
const { Collection } = require('discord.js');

module.exports = {
    setupCommands: (client) => {
        // Collection extends the JS Map
        client.commands = new Collection();
        const commandsPath = path.join(__dirname, 'commands');
        // readdirSync gets an array of files in a directory
        const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

        commandFiles.map(cf => {
            const cfPath = path.join(commandsPath, cf);
            const command = require(cfPath);

            if (!('data' in command) || !('execute' in command)) {
                console.log(`[WARNING] The command at ${cfPath} is missing a required "data" or "execute" property.`);
                return;
            }

            client.commands.set(command.data.name, command)
        });
    },

    handleSlashCommands: async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        console.log(interaction);

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}