const mongoose = require('mongoose');

const EnchantSchema = mongoose.Schema({
    key: String,
    level: Number
}, { _id: false });

module.exports = EnchantSchema;