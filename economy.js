const { addUser, getUserData } = require('./db.js');
const UserModel = require('./userschema.js');
const { DateTime } = require('luxon');

module.exports = {
    handleActivityIncome: async (message) => {
        const nameString = message.member.user.username;
        let data = await getUserData(nameString);
        
        if (!data) {
            console.log(`Unknown user sent a message.`);
            data = await addUser(nameString);
        }
        console.log(data);

        const startTime = data.activeBonusStartTime ? data.activeBonusStartTime : 0;
        const secondsDiff = DateTime.now().toUnixInteger() - startTime;

        console.log(`starttime: ${startTime}`);
        console.log(`secondsdiff: ${secondsDiff}`);
        console.log(`hMsgCount: ${data.hMsgCount}`);
        if (secondsDiff >= 3600) {
            data = await UserModel.findOneAndUpdate({ username: nameString }, { activeBonusStartTime: 0, hMsgCount: 0 });
        }

        if (data.hMsgCount >= 10) return;

        if (startTime > 0) {

            if ((data.hMsgCount < 5 && secondsDiff < 1800) ||
                (data.hMsgCount >= 5 && secondsDiff >= 1800)
            ){
                const newData = await UserModel.findOneAndUpdate({ username: nameString }, { hMsgCount: data.hMsgCount + 1 });
                console.log(`Increasing activity for ${nameString}: ${newData.hMsgCount}`);
                if (newData.hMsgCount >= 10) {
                    // hourly income
                    console.log(`Hourly income for ${nameString}`);
                    await UserModel.updateOne({ username: nameString }, { balance: data.balance + 10, activeBonusStartTime: 0, hMsgCount: 0 });

                    // daily income
                }
            } else if (data.hMsgCount < 5 && secondsDiff >= 1800) {
                // not active enough during 30 minutes
                await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: 0, hMsgCount: 0 });
            }
        } else {
            console.log(`Started activity count for ${nameString}`);
            await UserModel.updateOne({ username: nameString }, { activeBonusStartTime: DateTime.now().toUnixInteger(), hMsgCount: 0});
        }
    }
}