const mongoose = require('mongoose');
const EnchantSchema = require('./EnchantSchema');
const PastOwnerScema = require('./PastOwnerScema');
const ItemSchema = require('./ItemSchema');

const MysticSchema = mongoose.Schema({
    enchants: [EnchantSchema],
    lastseen: {
        type: Date,
        default: Date.now,
        index: true
    },
    flags: [String],
    owner: String,
    nonce: Number,
    lives: Number,
    maxLives: Number,
    tokens: Number,
    item: ItemSchema,
    pastOwners: [PastOwnerScema]
});

MysticSchema.index({enchants:1,nonce:1,maxLives:1});

module.exports = mongoose.model('Mystics', MysticSchema);