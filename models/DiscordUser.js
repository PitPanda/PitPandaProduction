const mongoose = require('mongoose');

const DiscordUserSchema = mongoose.Schema({
    _id: String,
    uuid: {
        type: String,
        index: true
    },
});

module.exports = mongoose.model('DiscordUsers', DiscordUserSchema);