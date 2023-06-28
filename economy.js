const { addUser, getUserData } = require('./db.js');
const UserModel = require('./userschema.js');
const { DateTime } = require('luxon');

module.exports = {
    handleActivityIncome: async (message) => {
        const nameString = message.member.user.username;
        const nowUnix = DateTime.now().toUnixInteger();
        let data = await getUserData(nameString);
        
        if (!data) {
            console.log(`Unknown user sent a message. Adding entry for ${nameString}`);
            data = await addUser(nameString);
        }
        // console.log(data);

        let startTime = 0;
        if (data.activeBonusStartTime) {
            startTime = data.activeBonusStartTime;
        } else {
            console.log(`No activeBonusStartTime found for ${nameString}`);
        }
        const secondsDiff = nowUnix - startTime;

        // console.log(`secondsdiff: ${secondsDiff}`);
        if (startTime > 0 && secondsDiff >= 1200) {
            console.log(`Resetting activity for ${nameString}. 20min passed or income received.`);
            await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: 0, hMsgCount: 1 });
            return;
        }

        if (data.hMsgCount >= 10) return;

        if (startTime > 0) {

            if ((data.hMsgCount < 5 && secondsDiff < 600) ||
                (data.hMsgCount >= 5 && secondsDiff >= 600)
            ){
                await UserModel.updateOne({ username: nameString }, { hMsgCount: data.hMsgCount + 1 });
                // console.log(`Increasing activity for ${nameString}: ${data.hMsgCount + 1}`);

                if (data.hMsgCount + 1 >= 10) {
                    console.log(`Periodic income for ${nameString}`);
                    let income = 5;

                    const lastDailyBonusVariable = data.lastDailyBonus ? data.lastDailyBonus : 0;

                    if (nowUnix - lastDailyBonusVariable > 22*60*60) {
                        console.log(`Daily income for ${nameString}. Time since last: ${nowUnix - lastDailyBonusVariable}`);
                        console.log(`nowUnix: ${nowUnix}, lastTime: ${lastDailyBonusVariable}`);
                        income += 100;
                    }

                    await UserModel.updateOne({ username: nameString }, {
                        balance: data.balance + income,
                        activeBonusStartTime: 0,
                        hMsgCount: 0,
                        lastDailyBonus: nowUnix
                    });
                }
            } else if (data.hMsgCount < 5 && secondsDiff >= 600) {
                console.log(`Resetting activity data for ${nameString}. Less than 5 messages in 10min.`);
                await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: 0, hMsgCount: 0 });
            }
        } else {
            console.log(`Started activity count for ${nameString}`);
            await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: nowUnix, hMsgCount: 1});
        }
    },

    updateBalance: async (usernameString, amount) => {
        const data = await getUserData(usernameString, 'balance');
        await UserModel.updateOne({ username: usernameString }, { balance: data.balance + amount });
    },

    giveBits: async (interaction) => {
        const sourceUsername = interaction.member.user.username;
        const targetUsername = interaction.options.getMentionable('targetuser').user.username;
        const amount = interaction.options.getInteger('amount');
        const sourceData = await getUserData(sourceUsername, 'balance');
        const targetData = await getUserData(targetUsername, 'balance');

        if (amount > sourceData.balance) {
            await interaction.reply({
                content: `You don't have that much to give.`,
                ephemeral: true
            });
            return;
        }

        await UserModel.updateOne({ username: sourceUsername }, {balance: sourceData.balance - amount});
        await UserModel.updateOne({ username: targetUsername }, {balance: targetData.balance + amount});

        await interaction.reply({
            content: `You gave ${targetUsername} ${amount} bits ★`,
            ephemeral: true
        })
    }
}