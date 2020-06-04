const mongoose = require('mongoose');
const EnchantSchema = require('./EnchantSchema');
const ItemSchema = require('./ItemSchema');

const MysticSchema = mongoose.Schema({
    enchants: [EnchantSchema],
    lastseen: {
        type: Date,
        index: true
    },
    flags: [String],
    owner: String,
    nonce: Number,
    lives: Number,
    maxLives: Number,
    tokens: Number,
    item: ItemSchema,
});

MysticSchema.index({enchants:1,nonce:1,maxLives:1});

module.exports = mongoose.model('Mystics', MysticSchema);