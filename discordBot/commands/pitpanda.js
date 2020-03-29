const Command = require('../Command');

function command(msg,rest){
    if(!rest[0]) return msg.reply('But who are you trying to pitpanda?');
    msg.reply(`https://pitpanda.rocks/players/${rest[0]}`);
}

module.exports = new Command(
    {
        name:'pitpanda',
        fn:command,
        description:'Link to a player\'s pitpanda page',
        example:`**$pitpanda [ign]**`
    }
);