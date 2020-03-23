const mongoose = require('mongoose');

const PendingRepSchema = mongoose.Schema({
    _id: String,
    from: {
        type:String,
        index:true
    },
    to: {
        type:String,
        index:true
    },
    comment: String,
    evidence: String
});

module.exports = mongoose.model('PendingReps', PendingRepSchema);