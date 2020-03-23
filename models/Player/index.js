const mongoose = require('mongoose');
const profileDisplaySchema = require('./ProfileDisplaySchema');
const scammerSchema = require('./ScammerSchema');

const lbPartial = {
    kills: Number,
    assists: Number,
    damageDealt: Number,
    damageReceived: Number,
    damageRatio: Number,
    highestStreak: Number,
    deaths: Number,
    kdr: Number,
    xp: {
        type: Number,
        index: true
    },
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
    lifetimeRenown: Number,
    arrowShots: Number,
    arrowHits: Number,
    jumpsIntoPit: Number,
    launcherLaunches: Number,
    totalJumps: Number,
    bounty: Number,
    genesisPoints: Number,
    joins: Number,
    enderchestOpened: Number
}

const PlayerSchema = mongoose.Schema({
    _id: String,
    lastsave: {
        type: Date,
        default: Date.now
    },
    name: String,
    displayName: String,
    ...lbPartial,
    profileDisplay: {
        type: profileDisplaySchema,
        default: undefined
    },
    scammer: {
        type: scammerSchema,
        default: undefined
    },
    exempt: {
        type: Boolean,
        default: undefined,
        index: true
    }
});

for(const key of Object.keys(lbPartial)){
    let index = {};
    index[key] = -1;
    index.lifetimeGold = -1;
    PlayerSchema.index(index);
}

module.exports = mongoose.model('Players', PlayerSchema);