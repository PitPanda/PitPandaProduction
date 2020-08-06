const Command = require('../Command');
const getDoc = require('../../apiTools/playerDocRequest');
const Player = require('../../models/Player');

const command = async (msg,rest) => {
    if(!rest[0]) msg.reply('Please provide a username');
    const doc = await getDoc(rest[0], {maxAge:Infinity});
    if(doc.error) return msg.reply(`An error has occured: ${doc.error}`);
    if(doc.flag) return msg.reply(`This player has been marked as a ${doc.flag.type} for: \`${doc.flag.notes}\``);
    const name = doc.displayName.replace(/§./g,'');
    const main = await Player.findOne({'flag.alts':{$elemMatch:{$eq:doc._id}}});
    if(!main) return msg.reply(`${name} has not been marked as a scammer.`);
    msg.reply(`This player has been marked as a ${main.flag.type} for: \`${main.flag.notes}\``);
}

module.exports = new Command(
    {
        name:'scammer',
        fn:command,
        description:'Check if a player is a scammer',
        type: 'tradecenter',
        example:`**$scammer [ign]**`
    }
);