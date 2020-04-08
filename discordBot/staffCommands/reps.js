const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');
const {MessageEmbed} = require('discord.js');

async function command(msg,rest,_,permlevel){
    if(!rest[0]) return msg.reply("Please provide an action (sent or recieved) and a user ID");
    switch(rest[0].toLowerCase()){
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

module.exports = new Command(
    {
        name: 'reps',
        fn: command,
        description:'View player\'s reps',
        example:`**$rep (sent|received) [user id]**`,
        permlevel:3
    }
);