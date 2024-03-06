const { mongoose } = require('mongoose');
const UserModel = require('./userschema');

module.exports = {
  initDb: async () => {
    try {
      await mongoose.connect(process.env.MONGO_CONN_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Database connection successful.');
    } catch (e) {
      console.log(e);
    }
  },
  addUser: (usernameString) => {
    const newUser = new UserModel({
      username: usernameString,
      balance: 0,
      activityBonusStartTime: 0,
      hMsgCount: 0,
      lastDailyBonus: 0
    });

    return newUser.save();
  },
  userExists: async (usernameString) => {
    const user = await UserModel.findOne({ username: usernameString });
    console.log(`User ${usernameString} exists: ${user !== null}`);
    return user !== null;
  },
  getUserData: async (usernameString, returnValues) => {
    const data = await UserModel.findOne({ username: usernameString }, returnValues);
    return data;
  }
};
