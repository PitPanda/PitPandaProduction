const Command = require('../Command');
const PendingRep = require('../../models/PendingRep');
const DiscordUser = require('../../models/DiscordUser');
const {invalidPermissions} = require('../permissions');
const {MessageEmbed} = require('discord.js');
const {getRef} = require('../../apiTools/apiTools');
const {TradeRoles} = require('../TradeCenter.json');

function command(msg,rest,_,permlevel){
    if(!rest[0]) return msg.reply("Please provide an action (accept, deny, delete, or inspect) and a case ID");
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
                    updateReps(msg,rep.to,(getRef(doc,"reps","length")||0)+1);
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
            DiscordUser.findOne({reps:{$elemMatch:{_id:rest[1]}}}).then(doc=>{
                if(!doc) return msg.reply('Couldn\'t find that rep!');
                doc.reps=doc.reps.filter(({_id})=>_id!==rest[1]);
                updateReps(msg, doc._id, doc.reps.length);
                doc.save();
                msg.reply('Rep has been deleted!');
            });
            break;
        case 'inspect':
            if(rest.length<2) return msg.reply('You are missing something?');
            DiscordUser.findOne({reps:{$elemMatch:{_id:rest[1]}}}).then(User=>{
                if(!User) return msg.reply('Couldn\'t find a rep with that id');
                let rep = User.reps.find(rep=>rep._id===rest[1]);
                msg.channel.send(
                    new MessageEmbed()
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

function updateReps(msg, id, reps){
    const guild = msg.guild;
    const client = msg.client;
    client.users.fetch(id).then(user=>{
        const gm = guild.member(user);
        if(gm){
            for(const role of TradeRoles){
                if(reps>=role.reps){
                    gm.roles.add(role.id);
                }else{
                    gm.roles.remove(role.id);
                }
            }
        }
    });
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