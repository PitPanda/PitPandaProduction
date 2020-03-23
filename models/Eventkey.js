const mongoose = require('mongoose');
const keySchema = mongoose.Schema({
    _id: String,
    created: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: String,
        index: true
    }
});
module.exports = mongoose.model('EventKeys',keySchema);