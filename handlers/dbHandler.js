const { mongoose } = require('mongoose');
const UserModel = require('../models/userschema');

const initDb = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_CONN_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connection successful.');
  } catch (e) {
    console.warn(e);
  }
};

const addUser = (usernameString) => {
  const newUser = new UserModel({
    username: usernameString,
    balance: 0,
    activityBonusStartTime: 0,
    hMsgCount: 0,
    lastDailyBonus: 0
  });

  return newUser.save();
};

const userExists = async (usernameString) => {
  const user = await UserModel.findOne({ username: usernameString });
  // console.log(`User ${usernameString} exists: ${user !== null}`);
  return user !== null;
};

const getUserData = async (usernameString, returnValues) => {
  if (usernameString === 'detkewldog') {
    usernameString = 'iamcheeseman';
  }

  const data = await UserModel.findOne({ username: usernameString }, returnValues);
  return data;
};

const getRpsLeaderboard = async () => {
  const data = await UserModel.find({ rpsStreaks: { $exists: true } }, { username: 1, rpsStreaks: 1 });

  console.log('leaderboard data:');
  console.log(data);

  var leaderboard = data.map((user) => {
    return {
      username: user.username,
      rpsStreaks: user.rpsStreaks,
      totalStreak: user.rpsStreaks['rock'] + user.rpsStreaks['paper'] + user.rpsStreaks['scissors']
    };
  });

  console.log('leaderboard:');
  console.log(leaderboard);

  leaderboard.sort((a, b) => {
    return b.totalStreak - a.totalStreak;
  });

  return leaderboard;
};

const updateUserData = async (usernameString, newValues) => {
  if (usernameString === 'detkewldog') {
    usernameString = 'iamcheeseman';
  }

  const data = await UserModel.updateOne({ username: usernameString }, newValues);
  return data;
};

module.exports = { initDb, addUser, userExists, getUserData, updateUserData, getRpsLeaderboard };
