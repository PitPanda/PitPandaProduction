const Command = require('../Command');
const {RichEmbed} = require('discord.js');
const DiscordUser = require('../../models/DiscordUser');
const playerDocRequest = require('../../apiTools/playerDocRequest');

function command(msg,rest,_,permlevel){
    let target = msg.mentions.members.first();
    let page = Number(rest[1]) || 0;
    if(!target) {
        target = msg.author;
        page = Number(rest[0]) || 0;
    }
    DiscordUser.findOne({_id:target.id}).then(User=>{
        if(!User) return msg.reply('That user is not verified or does not have any rep!');
        if(!User.reps || !User.reps.length) return msg.reply('That user does not have any rep. Oof');

        const pages = Math.ceil(User.reps.length/10);

        let title = `**<@${User._id}>'s reps**`;
        if(pages>1) title += ` (Page ${page+1}/${pages})`;
        const reps = User.reps.slice(page*10,(page+1)*10).map(rep=>`<@${rep.from}>: ${rep.comment} ${permlevel>=3?`(id: ${rep._id})`:''}`);
        let embed = new RichEmbed()
            .setDescription([title,'',...reps].join('\n'))
            .setColor('#9040ff');
        msg.channel.send(embed);
    });
    /*
    let target = msg.mentions.members.first();
    if(!target) return msg.reply('You didn\'t tag anyone');
    if(target.id===msg.author.id) return msg.reply('you can\'t rep your self silly');
    const reason = rest.slice(1).join(' ');
    const start = reason.indexOf('[');
    const end = reason.indexOf(']');
    if(start===-1 || end===-1) return msg.reply('Your comment is not formatted correctly, please put the comment inside [brackets]');
    const comment = reason.substring(start+1,end);
    const evidence = reason.substring(end+2) + ' ' + msg.attachments.map(attatch=>attatch.url).join(' ');
    msg.reply('Your rep is now being reviewed by staff.');
    RepLogHook.send(
        new RichEmbed()
            .setDescription(`**${msg.author} repped ${target}**`)
            .addField('Comment',comment)
            .addField('Evidence',evidence)
            .addField('Time',new Date().toLocaleString())
            .addField('ID',msg.id)
    );
    const rep = new PendingRep({
        _id: msg.id,
        sender: msg.author.id,
        receiver: target.id,
        comment,
        evidence
    });
    rep.save().catch(console.error);*/
}

module.exports = new Command(
    {
        name:'reps',
        fn:command,
        description:'Check some\'s reps',
        example:`**$reps [@user?] [page?]**`,
        permlevel:1
    }
);