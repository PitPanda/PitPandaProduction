const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema({
    id: {
        type:Number,
        index:true
    },
    meta: Number,
    name: String
}, { _id: false });

module.exports = ItemSchema;