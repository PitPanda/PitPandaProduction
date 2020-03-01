const Command = require('./Command');
const {WebhookClient, RichEmbed} = require('discord.js');
const PendingRep = require('../../models/PendingRep');
const RepLogHook = new WebhookClient('678842693324898325','x1LTfFFw6DsFVe8tzlxScMFgLCMspQE_VjN6onT4XG_qSLqBfnWfyF2wA3ozSCIGKejw');

function command(msg,rest){
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
    rep.save().catch(console.error);
}

module.exports = new Command(
    'rep',
    command,
    {
        description:'Rep a user with proof of trade\nEx: !rep <@671700686152531978> [feathers for repair kit] i.imgur.com/7udIRdV.png',
        example:`**$rep [@user] [[comment]] [evidence]**`
    }
);