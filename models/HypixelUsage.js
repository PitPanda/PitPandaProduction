const mongoose = require('mongoose');

const HypixelUsageSchema = mongoose.Schema({
    count: {
        type: Number,
        index: true
    },
    date: {
        type: Number,
        default: () => Math.floor(Date.now() / 86400e3),
        index: true,
        unique: true
    }
});

module.exports = mongoose.model('HypixelUsage', HypixelUsageSchema);