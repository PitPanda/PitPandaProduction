const mongoose = require('mongoose');

const EventLogSchema = mongoose.Schema({
    reporter: String,
    event: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EventLogs', EventLogSchema);