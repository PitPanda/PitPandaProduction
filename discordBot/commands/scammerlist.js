const Command = require('../Command');
const {MessageEmbed} = require('discord.js');
const scammerGrabber = require('../../apiTools/scammerGrabber');

const command = async (msg,rest) => {
    const page = (Number(rest[0]) || 1) - 1;
    const scammers = await scammerGrabber(page,10);
    const pages = Math.ceil(scammers.total/10);
    let title = `**Scammer list**`;
    if(pages>1) title += ` (Page ${page+1}/${pages})`;
    const reps = scammers.players.map(player=>`**[${player.name}](https://pitpanda.rocks/players/${player.uuid}):** ${player.scammer.notes} ${player.scammer.discordid?`<@${player.scammer.discordid}>`:''}`);
    let embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(reps.join('\n'))
        .setColor('#9040ff');
    msg.channel.send(embed);
}

module.exports = new Command(
    {
        name:'scammerlist',
        fn:command,
        description:'Check the scammer list',
        example:`**$scammerlist [page?]**`,
        type: 'tradecenter',
        permlevel:0
    }
);