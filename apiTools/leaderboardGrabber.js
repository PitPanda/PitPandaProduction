const Player = require('../models/Player');
const fields = require('../models/Player/leaderboardFields');
const getDoc = require('./playerDocRequest');

const perPage = 100;

const leaderboardGrabber = (primaryKey, page = 0, direction = -1) => {
    return new Promise((resolve, reject) => {
        if (!(primaryKey in fields)) return resolve({error:'Invalid leaderboard endpoint'});
        Player
            .find({ exempt: { $not: { $eq: true } }, [primaryKey]: {$exists: true } })
            .limit(perPage)
            .skip(perPage * page)
            .sort([[primaryKey, direction], ['_id', -1]])
            .then(players => 
                resolve(
                    players.map(player => ({ uuid: player._id, name: player.displayName, score: player[primaryKey] }))
                )
            );
    });
}; module.exports = leaderboardGrabber;