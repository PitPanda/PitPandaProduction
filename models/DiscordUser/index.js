const mongoose = require('mongoose');
const RepSchema = require('./RepSchema');

const DiscordUserSchema = mongoose.Schema({
    _id: String, //Discord ID
    uuid: String, //minecraft uuid
    reps: {
        type: [RepSchema],
        default: undefined
    }
});

module.exports = mongoose.model('DiscordUsers', DiscordUserSchema);