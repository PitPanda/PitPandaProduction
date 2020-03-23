const mongoose = require('mongoose');

const RepSchema = mongoose.Schema({
    _id: String, 
    from: {
        type: String,
        index: true
    }, 
    timestamp: {
        type: Date,
        default: Date.now
    },
    comment: String,
    evidence: String
});

module.exports = RepSchema;