const mongoose = require('mongoose');
const profileDisplaySchema = require('./ProfileDisplaySchema');
const flagSchema = require('./FlagSchema');
const lbPartial = require('./leaderboardFields');

const PlayerSchema = mongoose.Schema({
    _id: String,
    lastsave: {
        type: Date,
        default: Date.now,
    },
    lastinpit: {
        type: Date,
        index: true,
    },
    discord: String,
    name: String,
    nameLower: {
        type: String,
        index: true,
    },
    colouredName: String,
    formattedLevel: String,
    formattedRank: String,
    rank: String,
    ...lbPartial,
    allegiance: String,
    hatColor: String,
    profileDisplay: {
        type: profileDisplaySchema,
        default: undefined,
    },
    flag: flagSchema,
    exempt: {
        type: Boolean,
        default: undefined,
        index: true,
    },
});

PlayerSchema.virtual('levelName').get(function(){
    return `${this.formattedLevel} ${this.colouredName}`;
});

PlayerSchema.virtual('rankName').get(function(){
    if(this.rank==='NON') return this.colouredName;
    return `${this.formattedRank} ${this.colouredName}`;
});
PlayerSchema.virtual('displayName').get(function(){return this.levelName});

for(const key of Object.keys(lbPartial)){
    let index = {};
    index[key] = -1;
    index._id = -1;
    PlayerSchema.index(index);
}

module.exports = mongoose.model('Players', PlayerSchema);