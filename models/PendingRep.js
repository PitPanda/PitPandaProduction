const mongoose = require('mongoose');

const PendingRepSchema = mongoose.Schema({
    _id: String,
    sender: String, 
    receiver: String,
    comment: String,
    evidence: String
});

module.exports = mongoose.model('PendingReps',PendingRepSchema);