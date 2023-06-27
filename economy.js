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
        console.log(data);

        let startTime = nowUnix;
        if (!data.activeBonusStartTime) {

            startTime = data.activeBonusStartTime ? data.activeBonusStartTime : nowUnix;
            console.log(`No activeBonusStartTime found for ${nameString}`);
        }
        const secondsDiff = nowUnix - startTime;

        // console.log(`secondsdiff: ${secondsDiff}`);
        if (secondsDiff >= 1200) {
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

                    const lastDailyBonusTime = data.lastDailyBonusTime ? data.lastDailyBonusTime : 0;

                    if (nowUnix - lastDailyBonusTime > 22*60*60) {
                        console.log(`Daily income for ${nameString}. Time since last: ${nowUnix - lastDailyBonusTime}`);
                        console.log(`nowUnix: ${nowUnix}, lastTime: ${lastDailyBonusTime}`);
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
                // not active enough during 30 minutes
                console.log(`Resetting activity data for ${nameString}. Less than 5 messages in 10min.`);
                await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: 0, hMsgCount: 0 });
            }
        } else {
            console.log(`Started activity count for ${nameString}`);
            await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: nowUnix, hMsgCount: 1});
        }
    }
}