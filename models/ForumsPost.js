const mongoose = require('mongoose');

const ForumsPostSchema = mongoose.Schema({
    _id: Number,
    title: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    link: String,
    author: String
});

module.exports = mongoose.model('ForumsPosts', ForumsPostSchema);