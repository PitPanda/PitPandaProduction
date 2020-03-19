const mongoose = require('mongoose');

const PendingRepSchema = mongoose.Schema({
    _id: String,
    from: String,
    to: String,
    comment: String,
    evidence: String
});

module.exports = mongoose.model('PendingReps', PendingRepSchema);