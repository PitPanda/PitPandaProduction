const mongoose = require('mongoose');

const EnchantSchema = mongoose.Schema({
    key: String,
    level: Number
},{_id:false});

const ItemSchema = mongoose.Schema({
    id:Number,
    meta:Number,
    name:String
},{_id:false});

const MysticSchema = mongoose.Schema({
    enchants: [EnchantSchema],
    lastseen: {
        type: Date,
        default: Date.now
    },
    flags:[String],
    owner: String,
    nonce: Number,
    lives: Number,
    maxLives: Number,
    tokens: Number,
    item:ItemSchema
});

module.exports = mongoose.model('Mystics',MysticSchema);