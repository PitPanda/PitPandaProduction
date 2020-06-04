const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');

const command = async (msg,rest) => {
  msg.reply('pong');
}

module.exports = new Command(
  {
    name:'profile',
    fn:command,
    description:'edit your pitpanda profile',
    type: 'pitpanda',
    permlevel: 1,
    example:`**$pitpanda [ign]**`
  }
);