const Command = require('../Command');
const PendingRep = require('../../models/PendingRep');
const DiscordUser = require('../../models/DiscordUser');
const {invalidPermissions} = require('../permissions');
const {MessageEmbed} = require('discord.js');
const {getRef} = require('../../apiTools/apiTools');
const {TradeRoles} = require('../TradeCenter.json');

async function command(msg,rest,_,permlevel){
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
        case 'received':
            if(!rest[1]) return msg.reply('But who?');
            let target = msg.mentions.users.first();
            if(!target) {
                try{
                    target = await msg.client.users.fetch(rest[1]);
                }catch(e){
                    return msg.reply('Tag someome or use their discordid please.');
                }
            }
            const doc = await DiscordUser.findById(target.id);
            if(!doc) return msg.reply('That user is not verified or does not have any rep!');
            if(!doc.reps || !doc.reps.length) return msg.reply('That user does not have any rep. Oof');

            const pages = Math.ceil(doc.reps.length/10);
            let page = Number(rest[2]) || 0;
            let title = `**<@${doc._id}>'s received reps**`;
            if(pages>1) title += ` (Page ${page+1}/${pages})`;
            const reps = doc.reps.slice(page*10,(page+1)*10).map(rep=>`<@${rep.from}>: ${rep.comment} (id: ${rep._id})`);
            let embed = new MessageEmbed()
                .setDescription([title,'',...reps].join('\n'))
                .setColor('#9040ff');
            msg.channel.send(embed);
            break;
        case 'sent':
            const docs = await DiscordUser.find({reps:{$elemMatch:{from:rest[1]}}});
            let sentReps = docs.map(doc=>doc.reps.filter(rep=>rep.from===rest[1]).map(rep=>{rep.parent=doc._id; return rep;})).flat(1);
            if(!sentReps.length) return msg.reply('That user has not sent any reps');
            const sentPages = Math.ceil(sentReps.length/10);
            let sentPage = Number(rest[2]) || 0;
            let sentTitle = `**<@${rest[1]}>'s sent reps**`;
            if(sentPages>1) sentTitle += ` (Page ${sentPage+1}/${sentPages})`;
            const slice = sentReps.slice(sentPage*10,(sentPage+1)*10).map(rep=>`to <@${rep.parent}>: ${rep.comment} (id: ${rep._id})`);
            msg.channel.send(
                new MessageEmbed()
                .setDescription([sentTitle,'',...slice].join('\n'))
                .setColor('#9040ff')
            );
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
        example:`**$rep (accept|deny|delete|inspect) [case id]**`,
        permlevel:3
    }
);