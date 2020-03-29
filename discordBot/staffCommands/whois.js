const Command = require('../Command');
const { MessageEmbed } = require('discord.js');
const DiscordUser = require('../../models/DiscordUser');
const getDoc = require('../../apiTools/playerDocRequest');

const command = async (msg, rest) => {
    let target = msg.mentions.users.first();
    let discorddoc;
    let playerdoc;
    if(!target && rest[0]) {
        try{
            target = await msg.client.users.fetch(rest[0]);
        }catch(e){
            playerdoc = await getDoc(rest[0]);
            if(playerdoc._id) {
                discorddoc = await DiscordUser.findOne({uuid:playerdoc._id});
                if(discorddoc) target = {id:discorddoc._id};
                else if(playerdoc.discord){
                    const embed = new MessageEmbed()
                        .setDescription(`**Unverified player**\n**Discord:** ${playerdoc.discord}\n**IGN:** [${playerdoc.name}](https://pitpanda.rocks/players/${playerdoc._id})`)
                        .setColor((playerdoc.hatColor)?Number(playerdoc.hatColor).toString(16):'9040ff')
                    return msg.channel.send(embed);
                }
            }
        }
    }
    if(!target) return msg.reply('Sorry, I couldn\'t find who you were looking for');
    if(!discorddoc) discorddoc = await DiscordUser.findById(target.id);
    if(!discorddoc || !discorddoc.uuid) return msg.reply('This user does not have an associated minecraft account');
    if(!playerdoc) playerdoc = await getDoc(discorddoc.uuid);
    if(playerdoc.error) return msg.reply(`An error has occured: ${playerdoc.error}`);
    const embed = new MessageEmbed()
        .setDescription(`**Discord:** <@${target.id}>\n**IGN:** [${playerdoc.name}](https://pitpanda.rocks/players/${playerdoc._id})`)
        .setColor((playerdoc.hatColor)?Number(playerdoc.hatColor).toString(16):'9040ff')
    msg.channel.send(embed);
}

module.exports = new Command(
    {
        name:'whois',
        fn:command,
        description:'Check the ingame name of a verified user',
        example:`**$whois [@user]**`
    }
);