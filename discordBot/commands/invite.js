const Command = require('../Command');

function command(msg){
    msg.reply('https://discord.gg/MBCQQgz');
}

module.exports = new Command({
    name:'invite',
    fn:command,
    description:'Server invite link',
    example:`**$invite**`
});