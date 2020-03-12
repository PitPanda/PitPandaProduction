const Command = require('../Command');
const PendingRep = require('../../models/PendingRep');
const DiscordUser = require('../../models/DiscordUser');
const {invalidPermissions} = require('../permissions');
const {RichEmbed} = require('discord.js');

function command(msg,rest,_,permlevel){
    switch(rest[0]){
        case 'accept':
            if(permlevel<6) return invalidPermissions(msg,6,permlevel);
            if(rest.length<2) return msg.reply('You are missing something?');
            PendingRep.findOneAndDelete({_id:rest[1]}).then(rep=>{
                if(!rep) return msg.reply('Couldn\'t find that rep!');
                const finalRep = {
                    _id:rep._id,
                    from: rep.from,
                    comment: rep.comment,
                    evidence: rep.evidence
                };
                DiscordUser.findOneAndUpdate({_id:rep.to},{$push:{reps:finalRep}},{upsert:true}).then(doc=>{
                    msg.reply('Rep has been accept successfully!');
                }).catch(err=>{
                    console.error(err);
                    msg.reply('Something screwed up. oof');
                });
            })
            break;
        case 'deny':
            if(permlevel<6) return invalidPermissions(msg,6,permlevel);
            if(rest.length<2) return msg.reply('You are missing something?');
            PendingRep.findOneAndDelete({_id:rest[1]}).then(rep=>{
                if(!rep) msg.reply('Couldn\'t find that rep!');
                else msg.reply('Denied the rep!');
            });
            break;
        case 'delete':
            if(permlevel<6) return invalidPermissions(msg,6,permlevel);
            if(rest.length<2) return msg.reply('You are missing something?');
            DiscordUser.updateOne({reps:{$elemMatch:{_id:rest[1]}}},{$pull:{reps:{_id:rest[1]}}}).then(results=>{
                if(results.nModified) msg.reply('Rep has been deleted!');
                else msg.reply('Couldn\'t find that rep!');
            });
            break;
        case 'inspect':
            if(rest.length<2) return msg.reply('You are missing something?');
            DiscordUser.findOne({reps:{$elemMatch:{_id:rest[1]}}}).then(User=>{
                if(!User) return msg.reply('Couldn\'t find a rep with that id');
                let rep = User.reps.find(rep=>rep._id===rest[1]);
                msg.channel.send(
                    new RichEmbed()
                        .setDescription(`**Inspecting <@${rep.from}>'s rep to <@${User._id}>**`)
                        .addField('Comment',rep.comment)
                        .addField('Evidence',rep.evidence)
                        .addField('Time',new Date().toLocaleString())
                        .addField('ID',rep._id)
                );
            });
            break;
        default:
            msg.reply(`Unknown subcommand "${rest[0]}"`);
    }
}

module.exports = new Command(
    {
        name: 'rep',
        fn: command,
        description:'Used for rep management',
        example:`**$rep (accept|deny|delete|inspect) [id]**`,
        permlevel:3
    }
);