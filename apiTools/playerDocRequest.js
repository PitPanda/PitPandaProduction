const hypixelAPI = require('./playerRequest');
const Player = require('../models/Player');

/**
 * gets the username for a player
 * @param {string} uuid 
 * @returns {Promise<Doc>}
 */
const getDoc = (uuid, maxAge = 86400e3) => {
    const promise = new Promise(async resolve => {
        const player = await Player.findOne({ _id: uuid });

        if (!player || Date.now() - player.lastsave > maxAge) { //if player is not on record or been over 24 hours since last check
            const target = await hypixelAPI(uuid);
            if (target.error) resolve({ error: target.error });
            else target.playerDoc.then(resolve);
        } else {
            resolve(player);
        }
    });

    return promise;
}

module.exports = getDoc;