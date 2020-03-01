const Command = require('./Command');

function command(msg,rest){
    msg.reply(`https://pitpanda.rocks/players/${rest[0]}`);
}

module.exports = new Command(
    'pitpanda',
    command,
    {
        description:'Link to a player\'s pitpanda page',
        example:`**$pitpanda [username]**`
    }
);