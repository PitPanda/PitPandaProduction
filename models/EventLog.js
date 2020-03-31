const mongoose = require('mongoose');

const EventLogSchema = mongoose.Schema({
    reporter: {
        type: String,
        index: true
    },
    event: String,
    degree: String,
    type: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    coreporters: [String],
});

module.exports = mongoose.model('EventLogs', EventLogSchema);