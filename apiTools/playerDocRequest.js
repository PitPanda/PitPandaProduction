const hypixelAPI = require('./playerRequest');
const Player = require('../models/Player');

/**
 * gets the username for a player
 * @param {string} uuid 
 * @param {Number} maxAge
 * @param {doc} doc
 * @returns {Promise<Doc>}
 */
const getDoc = (uuid, options={}) => {
    const maxAge = options.maxAge;
    let doc = options.doc;
    const promise = new Promise(async resolve => {
        if(!doc) doc = await Player.findOne({ _id: uuid });
        if (!doc || !isAged(doc,maxAge)) {
            const target = await hypixelAPI(uuid);
            if (target.error) {
                if(doc) resolve(doc);
                else resolve({ error: target.error });
            }
            else target.playerDoc.then(resolve);
        } else {
            resolve(doc);
        }
    });

    return promise;
}

const day = 86400e3
const week = day * 7;
function isAged(doc, maxAge){
    if(maxAge) return Date.now() - doc.lastsave < maxAge;
    else return (Date.now()-doc.lastsave)/day<((Date.now()-doc.lastinpit)/week)**0.8+(1/12);
}

module.exports = getDoc;