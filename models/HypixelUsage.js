const mongoose = require('mongoose');

const HypixelUsageSchema = mongoose.Schema({
    count: Number,
    date: {
        type: Number,
        default: ()=>Math.floor(Date.now()/86400e3)
    }
});

module.exports = mongoose.model('HypixelUsage',HypixelUsageSchema);