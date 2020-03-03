const Command = require('./Command');
const tools = require('../botTools');
const PendingRep = require('../../models/PendingRep');
const DiscordUser = require('../../models/DiscordUser');

function command(msg,rest){
    if(!tools.isStaff(msg)) return msg.reply('You are not allowed to use this command!');
    if(!rest[0]) return msg.reply('Please provide a case id');
    PendingRep.findOneAndDelete({_id:rest[0]}).then(rep=>{
        if(!rep) return msg.reply('Couldn\'t find that rep!');
        const finalRep = {
            _id:rep._id,
            from: rep.sender,
            comment: rep.comment,
            evidence: rep.evidence
        };
        DiscordUser.findOneAndUpdate({_id:rep.receiver},{$push:{reps:finalRep}},{upsert:true}).then(doc=>{
            msg.reply('Rep has been accept successfully!');
        }).catch(err=>{
            console.error(err);
            msg.reply('Something screwed up. oof');
        });
    })
}

module.exports = new Command(
    'acceptrep',
    command,
    {
        description:'Confirm a rep',
        example:`**$acceptrep [id]**`,
        staff:true
    }
);