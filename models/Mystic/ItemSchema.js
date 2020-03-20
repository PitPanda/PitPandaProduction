const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema({
    id: Number,
    meta: Number,
    name: String
}, { _id: false });

module.exports = ItemSchema;