const hypixelAPI = require('./playerRequest');
const Player = require('../models/Player');

/**
 * gets the username for a player
 * @param {string} uuid 
 * @param {{maxAge:number,doc:any}} options
 * @returns {Promise<Doc>}
 */
const getDoc = async (uuid, options={}) => {
    const maxAge = options.maxAge;
    let doc = options.doc;
    if(!doc) doc = await Player.findOne({ _id: uuid });
    if (!doc || !isAged(doc,maxAge)) {
        const target = await hypixelAPI(uuid);
        if (target.error) {
            if(doc) return doc
            return { error: target.error };
        }
        else return await target.playerDoc;
    }
    return doc;
}

const day = 86400e3
const week = day * 7;
function isAged(doc, maxAge){
    if(typeof maxAge === 'number') return Date.now() - doc.lastsave < maxAge;
    else return (Date.now()-doc.lastsave)/day<((Date.now()-doc.lastinpit)/week)**0.8;
}

module.exports = getDoc;