const Command = require('../Command');
const EventLog = require('../../models/EventLog');
const EventKey = require('../../models/EventKey');

const command = async (msg, rest) => {
    if(!rest[0]) return msg.reply('You can either `inspect` or `revoke`');
    if(!rest[1]) return msg.reply('But what event? pls provide an event id');
    const event = await EventLog.findById(rest[1]);
    if(!event) return msg.reply('I couldn\'t find that event oof');
    switch(rest[0].toLowerCase()){
        case 'inspect': 
            return msg.reply(`The event was sent by <@${event.reporter}>`);
        case 'revoke': {
            const keyDeletion = await EventKey.findOneAndDelete({ owner:event.reporter });
            const eventDeletion = await EventLog.findByIdAndDelete(rest[1]);
            if(keyDeletion && eventDeletion) return msg.reply('Key revoked');
            else msg.reply('I don\'t know how this happened but something went wrong');
        }
        default: 
            return msg.reply('unknown command');
    }
}

module.exports = new Command({
    name:'event',
    fn:command,
    description:'inspect event sender or revoke event key',
    example:`**$event [inspect|revoke] [event id]**`,
    type: 'pitpanda',
    permlevel: 1
});