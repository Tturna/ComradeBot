const { mongoose } = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    activeBonusStartTime: {
        type: Number,
        required: false
    },
    hMsgCount: {
        type: Number,
        required: false
    },
    lastDailyBonus: {
        type: Number,
        required: false
    }
}, { timestamps: true });

const UserModel = mongoose.model('UserData', userSchema);
module.exports = UserModel;