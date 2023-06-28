const { updateBalance } = require('./economy.js');

const red = ':red_square:';
const yel = ':yellow_square:';
const gre = ':green_square:';
const wheelShifts = 20;
const finalShifts = 3;
const finalShiftMul = 3;
const shiftInterval = 500; // ms
const poolSize = 21;

module.exports = {
    roulette: async (interaction) => {

        const getRandomColor = () => {
            const rng = Math.random() * poolSize;

            if (rng < 1) return gre;
            if (rng < (poolSize - 1) / 2) return red;
            else return yel;
        }

        let wheel = Array(11).fill().map(() => getRandomColor());
        await interaction.editReply({
            content: `|${wheel.join(' ')}|`,
            ephemeral: !(interaction.options.getBoolean('public'))
        });

        let msgContent = '';
        setTimeout(() => {
            for (let i = 0; i < wheelShifts + finalShifts; i++) {
                wheel.shift();
                wheel.push(getRandomColor());
                const left = wheel.slice(0, 5);
                const right = wheel.slice(6);
                const mid = wheel[5];
                msgContent = `|${left.join(' ')}|${mid}|${right.join(' ')}|`;

                let interval = shiftInterval * (i + 1);
                if (i >= wheelShifts) {
                    let n = i - wheelShifts;
                    interval = shiftInterval * wheelShifts;
                    interval += shiftInterval * finalShiftMul * (n + 1);
                }                
                
                setTimeout(async () => {
                    interaction.editReply(`|${left.join(' ')}|${mid}|${right.join(' ')}|`);
                }, interval);
            }
        }, 1000);

        setTimeout(async () => {
            const win = wheel[5];
            const betAmount = interaction.options.getInteger('betamount');
            const betColor = interaction.options.getString('betcolor');
            const usernameString = interaction.member.user.username;

            let result = 0;
            let msg = '';
            if (betColor === 'red' && win === red ||
                betColor === 'yellow' && win === yel)
            {
                result = betAmount;
                msg = `${usernameString} won ${result} ★!`;
                console.log(msg);
            }
            else if (betColor === 'green' && win === gre) {
                result = betAmount * poolSize;
                msg = `${usernameString} won ${result} ★!`;
                console.log(msg);
            } else {
                result = -betAmount;
                msg = `${usernameString} lost ${-result} ★!`;
                console.log(msg);
            }

            await interaction.editReply({
                content: msgContent + '\n' + msg,
                ephemeral: !(interaction.options.getBoolean('public'))
            });

            console.log(`usernameString: ${typeof(usernameString)}, result: ${typeof(result)}`);
            console.log(`usernameString: ${usernameString}, result: ${result}`);
            updateBalance(usernameString, result);

        }, wheelShifts * shiftInterval + finalShifts * shiftInterval * finalShiftMul + 2000);
    }
}