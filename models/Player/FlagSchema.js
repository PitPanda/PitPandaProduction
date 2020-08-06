const mongoose = require('mongoose');

const scammerSchema = mongoose.Schema({
    discordid: {
        type: String,
        default: undefined
    },
    alts: {
        type: [String],
        default: undefined,
        index: true,
    },
    main: {
        type: String,
        default: undefined,
    },
    notes: String,
    evidence: String,
    timestamp:{
        type:Date,
        default: Date.now,
        index: true
    },
    addedby:{
        type: String,
        index: true
    },
    type: String
}, { _id: false });

module.exports = scammerSchema;