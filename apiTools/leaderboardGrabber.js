const Player = require('../models/Player');
const getDoc = require('./playerDocRequest');

const perPage = 20;

const leaderboardGrabber = (primaryKey, page = 0, direction = -1) => {
    return new Promise((resolve, reject) => {
        if (!Player.schema.tree[primaryKey]) return reject('Invalid ledaerboard endpoint');
        Player
            .find({ exempt: { $exists: false } })
            .limit(perPage)
            .skip(perPage * page)
            .sort([[primaryKey, direction], ['lifetimeGold', -1], ['xp', -1]])
            .then(results => {
                Promise.all(
                    results.map(player => getDoc(player._id))
                ).then(players =>
                    resolve(players.map(player => {
                        let subset = { uuid: player._id, name: player.displayName }
                        subset[primaryKey] = player[primaryKey];
                        return subset;
                    }))
                )
            });
    });
}; module.exports = leaderboardGrabber;