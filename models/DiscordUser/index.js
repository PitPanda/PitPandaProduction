const mongoose = require('mongoose');
const RepSchema = require('./RepSchema');

const DiscordUserSchema = mongoose.Schema({
    _id: String,
    uuid: {
        type: String,
        index: true
    },
    reps: {
        type: [RepSchema],
        default: undefined
    },
    lastCount: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('DiscordUsers', DiscordUserSchema);