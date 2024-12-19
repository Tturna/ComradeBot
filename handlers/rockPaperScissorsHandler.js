const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const { getUserData, updateUserData } = require('../handlers/dbHandler.js');
const roboticsId = '1119326839060570133';

const btnRock = new ButtonBuilder()
  .setCustomId('btnRock')
  .setLabel('Rock')
  .setStyle(ButtonStyle.Secondary);

const btnPaper = new ButtonBuilder()
  .setCustomId('btnPaper')
  .setLabel('Paper')
  .setStyle(ButtonStyle.Primary);

const btnScissors = new ButtonBuilder()
  .setCustomId('btnScissors')
  .setLabel('Scissors')
  .setStyle(ButtonStyle.Success);

const itemRow = new ActionRowBuilder()
  .addComponents(btnRock, btnPaper, btnScissors);

const btnIdMessageMap = {
  'btnRock': 'Rock :rock:',
  'btnPaper': 'Paper :page_facing_up:',
  'btnScissors': 'Scissors :scissors:'
};

// rock beats scissors etc.
const winMap = {
  'Rock': 'Scissors',
  'Scissors': 'Paper',
  'Paper': 'Rock'
};

const rockPaperScissors = async (interaction) => {
  if (interaction.channelId != roboticsId) {
    interaction.reply({
      content: 'Rock-paper-scissors is only allowed in #robotics',
      ephemeral: true
    });
    return;
  }

  const playerOneUsername = interaction.member.user.username;
  const targetUser = interaction.options.getMentionable('targetuser');
  const hasTargetUser = targetUser != null;
  var messageChallenge = '';
  var messageAccept = '';

  console.log('has target user: ' + hasTargetUser);

  if (hasTargetUser) {
    let targetUsername = targetUser.user.username;
    console.log('target user: ' + targetUsername);
  }

  const btnJoin = new ButtonBuilder()
    .setCustomId('btnJoin')
    .setLabel('Join')
    .setStyle(ButtonStyle.Success);

  const joinBtnRow = new ActionRowBuilder()
    .addComponents(btnJoin);

  var playerOneStreaksDoc = await getUserData(playerOneUsername, 'rpsStreaks');

  var hasStreaks = Object.prototype.hasOwnProperty.call(playerOneStreaksDoc.toObject(), 'rpsStreaks');

  if (!hasStreaks) {
    console.log(`Initializing RPS streaks for ${playerOneUsername}`);
    await updateUserData(playerOneUsername, {
      $set: {
        rpsStreaks: {
          'rock': 0,
          'paper': 0,
          'scissors': 0
        }
      }
    });

    playerOneStreaksDoc = await getUserData(playerOneUsername, 'rpsStreaks');
  }

  const playerOneStreaks = playerOneStreaksDoc['rpsStreaks'];

  console.log('player one streaks:');
  console.log(playerOneStreaks);

  console.log(`${playerOneUsername} has started rock paper scissors.`);

  messageChallenge = `**${playerOneUsername}** has started a game of Rock-Paper-Scissors! ${playerOneUsername}'s win streaks:\n:rock: :${playerOneStreaks['rock']} :page_facing_up: :${playerOneStreaks['paper']} :scissors: :${playerOneStreaks['scissors']}`;

  const initialResponse = await interaction.reply({
    content: `${messageChallenge}\nDo you accept the challenge?`,
    components: [joinBtnRow]
  });

  const collector = initialResponse.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 20000
  });

  var playerJoined = false;
  var playerOneItemSelected = false;
  var playerTwoItemSelected = false;
  var playerOneSelection = null;
  var playerTwoSelection = null;
  var playerTwoUsername = null;
  var playerTwoStreaks = null;

  collector.on('collect', async collectorInteraction => {
    const interactorUsername = collectorInteraction.member.user.username;

    if (!playerJoined) {
      if (interactorUsername == playerOneUsername) {
        await collectorInteraction.reply({
          content: ':x: You can not join your own game!',
          ephemeral: true
        });

        return;
      }

      playerJoined = true;
      playerTwoUsername = collectorInteraction.user.username;

      var playerTwoStreaksDoc = await getUserData(playerTwoUsername, 'rpsStreaks');
      hasStreaks = Object.prototype.hasOwnProperty.call(playerTwoStreaksDoc.toObject(), 'rpsStreaks');

      if (!hasStreaks) {
        console.log(`Initializing RPS streaks for ${playerTwoUsername}`);
        await updateUserData(playerTwoUsername, {
          $set: {
            rpsStreaks: {
              'rock': 0,
              'paper': 0,
              'scissors': 0
            }
          }
        });

        playerTwoStreaksDoc = await getUserData(playerTwoUsername, 'rpsStreaks');
      }

      playerTwoStreaks = playerTwoStreaksDoc['rpsStreaks'];
      //playerTwoStreaks = { 'rock': 0, 'paper': 0, 'scissors': 0 };

      console.log('player two streaks:');
      console.log(playerTwoStreaks);

      console.log(`${playerTwoUsername} joined rock paper scissors by ${playerOneUsername}`);

      await collectorInteraction.reply({
        content: 'You have joined the game',
        ephemeral: true
      });

      messageAccept = `\n**${playerTwoUsername}** has accepted the challenge! ${playerTwoUsername}'s win streaks:\n:rock: :${playerTwoStreaks['rock']} :page_facing_up: :${playerTwoStreaks['paper']} :scissors: :${playerTwoStreaks['scissors']}`;

      await interaction.editReply({
        content: `${messageChallenge}\n${messageAccept}\n\n*Waiting for ${playerOneUsername}...*\n*Waiting for ${playerTwoUsername}...*\n\nChoose your weapon :point_down:`,
        components: [itemRow]
      });

      return;
    }

    if (interactorUsername != playerOneUsername && interactorUsername != playerTwoUsername) {
      await collectorInteraction.reply({
        content: ':x: You are not in the game!',
        ephemeral: true
      });

      return;
    }

    const btnId = collectorInteraction.customId;
    const playerSelection = btnIdMessageMap[btnId];

    if (interactorUsername == playerOneUsername) {
      if (playerOneItemSelected) {
        await collectorInteraction.reply({
          content: `You have already selected ${playerOneSelection}`,
          ephemeral: true
        });

        return;
      }

      playerOneSelection = playerSelection;
      playerOneItemSelected = true;

      if (!playerTwoItemSelected) {
        await interaction.editReply({
          content: `${messageChallenge}\n${messageAccept}\n\n*${playerOneUsername} has chosen a weapon*\n*Waiting for ${playerTwoUsername}...*\n\nChoose your weapon :point_down:`,
          components: [itemRow]
        });
      }
    }
    else if (interactorUsername == playerTwoUsername) {
      if (playerTwoItemSelected) {
        await collectorInteraction.reply({
          content: `You have already selected ${playerTwoSelection}`,
          ephemeral: true
        });

        return;
      }

      playerTwoSelection = playerSelection;
      playerTwoItemSelected = true;

      if (!playerOneItemSelected) {
        await interaction.editReply({
          content: `${messageChallenge}\n${messageAccept}\n\n*Waiting for ${playerOneUsername}...*\n*${playerTwoUsername} has chosen a weapon*\n\nChoose your weapon :point_down:`,
          components: [itemRow]
        });
      }
    }

    await collectorInteraction.reply({
      content: `You selected ${playerSelection}.`,
      ephemeral: true
    });

    if (!playerOneItemSelected || !playerTwoItemSelected) return;

    if (playerOneSelection == playerTwoSelection) {
      await interaction.editReply({
        content: `${messageChallenge}\n${messageAccept}\n\n*${playerOneUsername} chose ${playerOneSelection}*\n*${playerTwoUsername} chose ${playerTwoSelection}*\n### It's a draw!`,
        components: []
      });

      return;
    }

    var winnerUsername = null;
    var winnerStreaks = null;
    var winnerSelection = null;
    var loserUsername = null;
    var loserStreaks = null;
    var loserSelection = null;

    const p1SimpleSelection = playerOneSelection.split(' ')[0];
    const p2SimpleSelection = playerTwoSelection.split(' ')[0];

    if (winMap[p1SimpleSelection] == p2SimpleSelection) {
      winnerUsername = playerOneUsername;
      winnerStreaks = playerOneStreaks;
      winnerSelection = p1SimpleSelection;
      loserSelection = p2SimpleSelection;
      loserStreaks = playerTwoStreaks;
      loserUsername = playerTwoUsername;
    }
    else {
      winnerUsername = playerTwoUsername;
      winnerStreaks = playerTwoStreaks;
      winnerSelection = p2SimpleSelection;
      loserUsername = playerOneUsername;
      loserStreaks = playerOneStreaks;
      loserSelection = p1SimpleSelection;
    }

    console.log(`${winnerUsername} won rock paper scissors against ${loserUsername}.`);

    const winMultiplier = Math.max(0, Math.log(winnerStreaks[winnerSelection.toLowerCase()] * 3 + 1)) + 1;
    const winAmount = Math.round(winMultiplier * 5);

    await interaction.editReply({
      content: `${messageChallenge}\n${messageAccept}\n\n*${playerOneUsername} chose ${playerOneSelection}*\n*${playerTwoUsername} chose ${playerTwoSelection}*\n## ${winnerUsername} won!\n+${winAmount} bits ★ (${winnerStreaks[winnerSelection.toLowerCase()] + 1}x streak multiplier)`,
      components: []
    });

    winnerStreaks[winnerSelection.toLowerCase()]++;
    loserStreaks[loserSelection.toLowerCase()] = 0;

    // this db fetch could be combined above
    const winnerBalanceDoc = await getUserData(winnerUsername, 'balance');
    const winnerBalance = winnerBalanceDoc.balance;

    await updateUserData(winnerUsername, {
      balance: winnerBalance + winAmount,
      rpsStreaks: winnerStreaks
    });

    await updateUserData(loserUsername, {
      rpsStreaks: loserStreaks
    });
  });
};

module.exports = { rockPaperScissors };
