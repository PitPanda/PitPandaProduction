const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');

const command = async (msg, rest) => {
    if(!rest[0]) return msg.reply('You can either `add` or `remove` someone');
    if(!rest[1]) return msg.reply('But who');
    let doc = await DiscordUser.findById(rest[1]);
    if(!doc) doc = new DiscordUser({_id:rest[1]});
    switch(rest[0]){
        case 'add': {
            doc.patron = true;
            await doc.save();
            return msg.reply('Successfully added');
        }
        case 'remove': {
            doc.patron = undefined;
            await doc.save();
            return msg.reply('Successfully removed');
        }
        default: 
            return msg.reply('unknown command');
    }
}

module.exports = new Command({
    name:'patron',
    fn:command,
    description:'add or remove patrons',
    example:`**$patron [add|remove]**`,
    permlevel: Infinity
});