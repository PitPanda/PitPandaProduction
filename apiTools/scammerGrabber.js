const Player = require('../models/Player');

let total = 0;
let lastupdate = 0;

const scammerQuery = { 'scammer.main': {$exists:false}, scammer: {$exists:true} };

const scammerGrabber = async (page = 0, perPage = 100) => {
    if(Date.now()-lastupdate>900e3) {
        total = await Player.find(scammerQuery).countDocuments();
        lastupdate = Date.now();
    }
    const players = await Player
        .find(scammerQuery)
        .limit(perPage)
        .skip(perPage * page)
        .sort([['scammer.timestamp', -1]])
        .select({name:1,scammer:1});
    return {
        total,
        players: players.map(player => ({ uuid: player._id, name: player.name, scammer: player.scammer })),
    }
}; module.exports = scammerGrabber;