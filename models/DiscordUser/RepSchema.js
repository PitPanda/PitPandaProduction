const mongoose = require('mongoose');

const RepSchema = mongoose.Schema({
    _id: String, //passed from the pending rep stage
    from: String, //giver uuid
    timestamp: {
        type: Date,
        default: Date.now
    },
    comment: String,
    evidence: String
});

module.exports = RepSchema;