const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');

const command = async (msg,rest) => {
    if(!rest[0]) return msg.reply('But who are you trying to pitpanda?');
    const target = msg.mentions.members.first();
    if(target){
        const player = await DiscordUser.findById(target.id);
        if(!player) return msg.reply('This user\'s account is not linked');
        msg.reply(`https://pitpanda.rocks/players/${player.uuid}`);
    }
    else msg.reply(`https://pitpanda.rocks/players/${rest[0]}`);
}

module.exports = new Command(
    {
        name:'pitpanda',
        fn:command,
        description:'Link to a player\'s pitpanda page',
        type: 'tradecenter',
        example:`**$pitpanda [ign]**`
    }
);