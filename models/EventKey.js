const mongoose = require('mongoose');
const keySchema = mongoose.Schema({
    _id: String,
    created: {
        type: Date,
        default: Date.now
    },
    owner: String
});
module.exports = mongoose.model('EventKeys',keySchema);