const mongoose = require('mongoose');

const EventLogSchema = mongoose.Schema({
    reporter: {
        type: String,
        index: true
    },
    event: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('EventLogs', EventLogSchema);