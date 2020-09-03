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
    searches: Number,
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
    special: String,
    prestigeTimes: [Date],
});

PlayerSchema.virtual('levelName').get(function(){
    return `${this.formattedLevel} ${this.colouredName}`;
});

PlayerSchema.virtual('rankName').get(function(){
    if(this.rank==='NON') return this.colouredName;
    return `${this.formattedRank} ${this.colouredName}`;
});
PlayerSchema.virtual('displayName').get(function(){return this.levelName});

const Player = mongoose.model('Players', PlayerSchema);

/*
// convert legacy profiles to current
(async()=>{
    const docs = await Player.find({profileDisplay:{$exists:true}});
    docs.forEach(doc => {
        if(doc.description) return;
        const description = [];
        const dsp = doc.profileDisplay;
        if(dsp.message) description.push({type:"text",content:dsp.message});
        if(dsp.url) description.push({type:"link",url:dsp.url,title:dsp.linkTitle});
        dsp.description = description
        doc.save()
    })
})();
*/

module.exports = Player;
