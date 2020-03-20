const mongoose = require('mongoose');

const profileDisplaySchema = mongoose.Schema({
    url: String,
    linkTitle: String,
    message: String,
    title: String
}, { _id: false });

module.exports = profileDisplaySchema;