const mongoose = require('mongoose');
const EnchantSchema = require('./EnchantSchema');
const ItemSchema = require('./ItemSchema');

const MysticSchema = mongoose.Schema({
    enchants: [EnchantSchema],
    lastseen: {
        type: Date,
        default: Date.now
    },
    flags: [String],
    owner: String,
    nonce: Number,
    lives: Number,
    maxLives: Number,
    tokens: Number,
    item: ItemSchema
});

module.exports = mongoose.model('Mystics', MysticSchema);