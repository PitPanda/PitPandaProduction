const Command = require('../Command');
const {MessageEmbed} = require('discord.js');
const DiscordUser = require('../../models/DiscordUser');
const playerDocRequest = require('../../apiTools/playerDocRequest');

async function command(msg,rest){
    let target = msg.mentions.members.first();
    let page = Number(rest[1]) || 0;
    if(!target) {
        target = msg.author;
        page = Number(rest[0]) || 0;
    }
    const User = await DiscordUser.findOne({_id:target.id})
    if(!User) return msg.reply('That user is not verified or does not have any rep!');
    if(!User.reps || !User.reps.length) return msg.reply('That user does not have any rep. Oof');

    const pages = Math.ceil(User.reps.length/10);

    let title = `**<@${User._id}>'s reps**`;
    if(pages>1) title += ` (Page ${page+1}/${pages})`;
    const reps = User.reps.slice(page*10,(page+1)*10).map(rep=>`<@${rep.from}>: ${rep.comment}`);
    let embed = new MessageEmbed()
        .setDescription([title,'',...reps].join('\n'))
        .setColor('#9040ff');
    msg.channel.send(embed);
}

module.exports = new Command(
    {
        name:'reps',
        fn:command,
        description:'Check some\'s reps',
        example:`**$reps [@user?] [page?]**`,
        type: 'tradecenter',
        permlevel:1
    }
);