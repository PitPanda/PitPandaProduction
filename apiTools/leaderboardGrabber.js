const Player = require('../models/Player');
const getDoc = require('./playerDocRequest');

const perPage = 100;

const leaderboardGrabber = (primaryKey, page = 0, direction = -1) => {
    return new Promise((resolve, reject) => {
        if (!Player.schema.tree[primaryKey]) return resolve({error:'Invalid ledaerboard endpoint'});
        Player
            .find({ exempt: { $not: { $eq: true } } })
            .limit(perPage)
            .skip(perPage * page)
            .sort([[primaryKey, direction], ['lifetimeGold', -1]])
            .then(players => 
                resolve(
                    players.map(player => ({ uuid: player._id, name: player.displayName, score: player[primaryKey] }))
                        .sort((a,b)=>b[primaryKey]-a[primaryKey])
                )
            );
    });
}; module.exports = leaderboardGrabber;