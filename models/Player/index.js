const mongoose = require('mongoose');
const profileDisplaySchema = require('./ProfileDisplaySchema');
const scammerSchema = require('./ScammerSchema');
const lbPartial = require('./leaderboardFields');

const PlayerSchema = mongoose.Schema({
    _id: String,
    lastsave: {
        type: Date,
        default: Date.now
    },
    lastinpit: Date,
    name: String,
    displayName: String,
    ...lbPartial,
    allegiance: String,
    hatColor: String,
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