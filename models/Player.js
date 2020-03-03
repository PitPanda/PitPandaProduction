const mongoose = require('mongoose');

const PlayerSchema = mongoose.Schema({
    _id: String,
    lastsave: {
        type: Date,
        default: Date.now
    },
    name: String,
    displayName: String,
    kills: Number,
    assists: Number,
    damageDealt: Number,
    damageReceived: Number,
    damageRatio: Number,
    highestStreak: Number,
    deaths: Number,
    kdr: Number,
    xp: Number,
    gold: Number,
    lifetimeGold: Number,
    playtime: Number,
    contracts: Number,
    gapples: Number,
    gheads: Number,
    lavaBuckets: Number,
    soups: Number,
    tierThrees: Number,
    darkPants: Number,
    leftClicks: Number,
    chatMessages: Number,
    wheatFarmed: Number,
    fishedAnything: Number,
    blocksBroken: Number,
    blocksPlaced: Number,
    kingsQuests: Number,
    sewerTreasures: Number,
    nightQuests: Number,
    renown: Number,
    lifetimeRenown: Number
});

module.exports = mongoose.model('Players',PlayerSchema);