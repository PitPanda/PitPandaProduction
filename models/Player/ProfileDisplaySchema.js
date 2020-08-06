const mongoose = require('mongoose');

const profileDisplaySchema = mongoose.Schema({
    url: String,
    linkTitle: String,
    message: String,
    title: String,
    alts: {
        default: undefined,
        type: [String],
        index: true,
    }
}, { _id: false });

module.exports = profileDisplaySchema;