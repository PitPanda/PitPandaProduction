const mongoose = require('mongoose');

const scammerSchema = mongoose.Schema({
    discordid: {
        type: String,
        default: undefined
    },
    alts: {
        type: [String],
        default: undefined
    },
    main: {
        type: String,
        default: undefined,
    },
    notes: String
}, { _id: false });

module.exports = scammerSchema;