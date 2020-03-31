const Player = require('../models/Player');
const fields = require('../models/Player/leaderboardFields');

const leaderboardGrabber = (primaryKey, page = 0, perPage = 100) => {
    return new Promise(resolve => {
        if (!(primaryKey in fields)) return resolve({error:'Invalid leaderboard endpoint'});
        Player
            .find({ exempt: { $not: { $eq: true } }, [primaryKey]: {$exists: true } })
            .limit(perPage)
            .skip(perPage * page)
            .sort([[primaryKey, -1], ['_id', -1]])
            .select({colouredName:1,formattedLevel:1,[primaryKey]:1})
            .then(players => 
                resolve(
                    players.map(player => ({ uuid: player._id, name: player.displayName, score: player[primaryKey] }))
                )
            );
    });
}; module.exports = leaderboardGrabber;