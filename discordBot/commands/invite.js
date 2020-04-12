const Command = require('../Command');

function command(msg){
    msg.reply('https://discord.gg/CdTmYrG');
}

module.exports = new Command({
    name:'invite',
    fn:command,
    description:'Server invite link',
        type: 'tradecenter',
        example:`**$invite**`
});