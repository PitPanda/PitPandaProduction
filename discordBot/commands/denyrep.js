const Command = require('./Command');
const tools = require('../botTools');
const PendingRep = require('../../models/PendingRep');
const DiscordUser = require('../../models/DiscordUser');

function command(msg,rest){
    if(!tools.isStaff(msg)) return msg.reply('You are not allowed to use this command!');
    if(!rest[0]) return msg.reply('Please provide a case id');
    PendingRep.findOneAndDelete({_id:rest[0]}).then(rep=>{
        if(!rep) msg.reply('Couldn\'t find that rep!');
        else msg.reply('Denied the rep!');
    })
}

module.exports = new Command(
    'denyrep',
    command,
    {
        description:'Deny a rep',
        example:`**$denyrep [id]**`,
        staff:true
    }
);