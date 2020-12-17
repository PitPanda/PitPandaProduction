const hypixelAPI = require('./playerRequest');
const Player = require('../models/Player');

/**
 * gets the player doc
 * @param {string} tag 
 * @param {{maxAge:number,doc:any}} options
 */
const getDoc = async (tag, options={}) => {
    const maxAge = options.maxAge;
    let doc = options.doc;
    if(!doc) {
        if(tag.length===32) doc = await Player.findById(tag);
        else {
            doc = await Player.findOne({ nameLower: tag.toLowerCase() });
            if(!doc && /#\d{4}$/.test(tag)) doc = await Player.findOne({ discord: tag });
        }
    }
    if (!doc || !isAged(doc,maxAge)) {
        const target = await hypixelAPI.player(tag);
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
    else return (Date.now()-doc.lastsave)/day<((Date.now()-doc.lastinpit)/week)**0.3+(Date.now()-doc.lastinpit)/week;
}

module.exports = getDoc;