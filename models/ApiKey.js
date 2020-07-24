const mongoose = require('mongoose');

const ApiKey = mongoose.Schema({
    _id: String,
    name: String,
    limit: Number,
});

module.exports = mongoose.model('ApiKeys', ApiKey);