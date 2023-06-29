const { updateBalance } = require('./economy.js');
const { getUserData } = require('./db.js');

const roboticsId = '1119326839060570133';

const red = ':red_circle:';
const yel = ':yellow_circle:';
const gre = ':green_circle:';
const blu = ':blue_circle:';
const rrr = ':red_square:';
const yyy = ':yellow_square:';
const ggg = ':green_square:';
const bbb = ':blue_square:';
const blk = ':black_large_square:';
const str = ':star:';
const arw = ':arrow_down:';

const wheelShifts = 20;
const finalShifts = 3;
const finalShiftMul = 3;
const shiftInterval = 500; // ms

module.exports = {
    roulette: async (interaction) => {
        if (interaction.channelId != roboticsId) {
            interaction.reply({
                content: `Roulette is only allowed in #robotics`,
                ephemeral: true
            });
            return;
        }
        
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean('hidden')});

        const usernameString = interaction.member.user.username;
        const betAmount = interaction.options.getInteger('betamount');
        const betColor = interaction.options.getString('betcolor');
        const data = await getUserData(usernameString, 'balance');

        let betColorEmoji = '';
        if (betColor == 'red') betColorEmoji = rrr;
        else if (betColor == 'yellow') betColorEmoji = yyy;
        else if (betColor == 'blue') betColorEmoji = bbb;
        else if (betColor == 'green') betColorEmoji = ggg;
        const headerMsg = `${blk}${blk}${blk}${blk}${blk}${blk}${arw}${blk}${betColorEmoji}\`${betAmount} Bits ★\`\n`;

        console.log(`bet: ${betAmount}, balance: ${data.balance}`);
        if (betAmount > data.balance) {
            interaction.editReply(`You don\'t have enough bits ★ to place a bet of ${betAmount}`);
            return;
        }

        const getRandomColor = () => {
            let rng = Math.random() * 50;

            if (rng < 1) return gre;
            rng -= 1;
            if (rng < 9) return blu;
            rng -= 9;
            if (rng < 20) return red;
            else return yel;
        }

        let wheel = Array(11).fill().map(() => getRandomColor());
        await interaction.editReply({
            content: `${headerMsg}${blk}${wheel.join('')}${blk}\n*Placing bet...*`,
            ephemeral: interaction.options.getBoolean('hidden')
        });
        
        await updateBalance(usernameString, -betAmount);

        let msgContent = '';
        setTimeout(() => {
            for (let i = 0; i < wheelShifts + finalShifts; i++) {
                wheel.shift();
                wheel.push(getRandomColor());
                const left = wheel.slice(0, 5);
                const right = wheel.slice(6);
                const mid = wheel[5];
                
                let interval = shiftInterval * (i + 1);
                if (i >= wheelShifts) {
                    let n = i - wheelShifts;
                    interval = shiftInterval * wheelShifts;
                    interval += shiftInterval * finalShiftMul * (n + 1);
                }                
                
                setTimeout(async () => {
                    msgContent = `${headerMsg}${blk}${left.join('')}${mid}${right.join('')}${blk}`;
                    interaction.editReply(msgContent);
                }, interval);
            }
        }, 1000);

        setTimeout(async () => {
            const win = wheel[5];

            let result = 0;
            let msg = '';
            if (betColor === 'red' && win === red ||
                betColor === 'yellow' && win === yel)
            {
                result = Math.round(betAmount * 2.5);
                msg = `${usernameString} won ${result} ★!`;
                console.log(msg);
            }
            else if (betColor === 'blue' && win === blu) {
                result = Math.round(betAmount * (50 / 9));
                msg = `${usernameString} won ${result} ★!`;
                console.log(msg);
            }
            else if (betColor === 'green' && win === gre) {
                result = betAmount * 50;
                msg = `${usernameString} won ${result} ★!`;
                console.log(msg);
            } else {
                result = -betAmount;
                msg = `${usernameString} lost ${-result} ★!`;
                console.log(msg);
            }

            await interaction.editReply({
                content: msgContent + '\n' + msg,
                ephemeral: interaction.options.getBoolean('hidden')
            });

            console.log(`usernameString: ${typeof(usernameString)}, result: ${typeof(result)}`);
            console.log(`usernameString: ${usernameString}, result: ${result}`);
            if (result < 0) return;
            updateBalance(usernameString, result);

        }, wheelShifts * shiftInterval + finalShifts * shiftInterval * finalShiftMul + 2000);
    }
}