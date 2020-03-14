const hypixelAPI = require('./playerRequest');
const Player = require('../models/Player');
/**
 * gets the username for a player
 * @param {string} uuid 
 * @returns {Promise<Doc>}
 */
function getDoc(uuid, maxAge=86400e3){
    return new Promise(resolve=>{
        Player.findOne({_id:uuid}).then(player=>{
            if(!player || Date.now()-player.lastsave > maxAge) { //if player is not on record or been over 24 hours since last check
                hypixelAPI(uuid).then(target=>{
                    if(target.error) resolve({error:target.error});
                    else resolve(target.playerDoc);
                })
            }else{
                player.cached=true;
                resolve(player);
            }
        });
    });
} module.exports = getDoc;