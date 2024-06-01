const { Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const { DateTime } = require('luxon');

module.exports = {
  groupmeme: async (interaction) => {
    const btnred = new ButtonBuilder()
      .setCustomId('btnred')
      .setLabel('Red')
      .setStyle(ButtonStyle.Danger);

    const btnyel = new ButtonBuilder()
      .setCustomId('btnyel')
      .setLabel('Yellow')
      .setStyle(ButtonStyle.Secondary);

    const btnblu = new ButtonBuilder()
      .setCustomId('btnblu')
      .setLabel('Blue')
      .setStyle(ButtonStyle.Primary);

    const btngre = new ButtonBuilder()
      .setCustomId('btngre')
      .setLabel('Green')
      .setStyle(ButtonStyle.Success);

    const colorRow = new ActionRowBuilder()
      .addComponents(btnred, btnyel, btnblu, btngre);

    const halfbtn = new ButtonBuilder()
      .setCustomId('halfbet')
      .setLabel('0.5x')
      .setStyle(ButtonStyle.Secondary);

    const fullbtn = new ButtonBuilder()
      .setCustomId('fullbet')
      .setLabel('1x')
      .setStyle(ButtonStyle.Secondary);

    const doublebtn = new ButtonBuilder()
      .setCustomId('doublebet')
      .setLabel('2x')
      .setStyle(ButtonStyle.Secondary);

    const quintbtn = new ButtonBuilder()
      .setCustomId('quintbet')
      .setLabel('5x')
      .setStyle(ButtonStyle.Secondary);

    const amountRow = new ActionRowBuilder()
      .addComponents(halfbtn, fullbtn, doublebtn, quintbtn);

    const ogBetAmount = interaction.options.getInteger('betamount');
    const response = await interaction.reply({
      content: `Join roulette! Select your bet color and muliplier for the original bet: ${ogBetAmount} Bits ★\nBetting ends in: <t:${DateTime.now().toUnixInteger() + 20}:R>`,
      components: [colorRow, amountRow]
    });

    const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 20000 });

    let players = new Collection();
    collector.on('collect', async i => {
      const selection = i.customId;
      const user = i.user.username;
      let betColor = '';
      let betAmount = 0;

      if (selection == 'btnred') betColor = 'red';
      else if (selection == 'btnyel') betColor = 'yellow';
      else if (selection == 'btnblu') betColor = 'blue';
      else if (selection == 'btngre') betColor = 'green';
      else if (selection == 'halfbet') betAmount = ogBetAmount * 0.5;
      else if (selection == 'fullbet') betAmount = ogBetAmount;
      else if (selection == 'doublebet') betAmount = ogBetAmount * 2;
      else if (selection == 'quintbet') betAmount = ogBetAmount * 5;

      let exAmount = 0;
      let exColor = '';
      let fi = i;
      let pl = null;
      if (players.has(user)) {
        pl = players.get(user);
        if (pl.betAmount > 0 && pl.betColor != '') return;
        exAmount = pl.betAmount;
        exColor = pl.betColor;
        if (pl.firstInteraction) {
          fi = pl.firstInteraction;
          i.reply('Bet accepted');
          i.deleteReply();
        }
      } else {
        await i.deferReply();
      }

      console.log(`ogAmount: ${ogBetAmount}`);
      console.log(`exAmount: ${exAmount}`);
      console.log(`exColor: ${exColor}`);
      console.log(`betColor: ${betColor}`);
      console.log(`betAmount: ${betAmount}\n`);

      if (betColor != '') {
        players.set(user, { betAmount: exAmount, betColor: betColor, firstInteraction: fi });
        await fi.editReply(`${user} betting on ${betColor}`);
      }
      else if (betAmount != 0) {
        players.set(user, { betAmount: betAmount, betColor: exColor, firstInteraction: fi });
        await fi.editReply(`${user} betting ${betAmount} Bits ★`);
      }

      pl = players.get(user);
      if (pl.betAmount > 0 && pl.betColor != '') {
        await fi.editReply(`${user} bet ${pl.betAmount} ★ on ${pl.betColor}`);
      }

      // await i.reply(`${user} has selected ${selection}!`);
    });
  }
};
