const Command = require('../Command');
const playerDoc = require('../../apiTools/playerDocRequest');

const command = async (msg, rest) => {
    if(!rest[0]) return msg.reply('You can either `add` or `remove` someone');
    if(!rest[1]) return msg.reply('But who');
    let doc = await playerDoc(rest[1]);
    if(doc.error) return msg.reply(`Uh Oh, ${doc.error}`); 
    switch(rest[0].toLowerCase()){
        case 'add': {
            doc.special = rest[2] || 'patron';
            await doc.save();
            return msg.reply('Successfully added');
        }
        case 'remove': {
            doc.special = undefined;
            await doc.save();
            return msg.reply('Successfully removed');
        }
        default: 
            return msg.reply('unknown command');
    }
}

module.exports = new Command({
    name:'special',
    fn:command,
    description:'add or remove users with special permissions',
    example:`**$special [add|remove] [ign or uuid]**`,
    type: 'all',
    permlevel: Infinity
});