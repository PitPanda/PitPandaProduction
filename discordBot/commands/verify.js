const TradeCenter = require('../TradeCenter.json');
const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');
const hypixelAPI = require('../../apiTools/playerRequest');

const command = async (msg,rest,alias) => {
    const verify = alias===`verify`;
    if(!rest[0]) return msg.reply(`Please include your username. Ex: \`.${verify?'verify':'prestige'} mcpqndq\``);
    const result = await hypixelAPI(rest[0].toLowerCase())
    const gmrm = msg.member.roles;
    if(result.error) return msg.reply(result.error);
    if(!result.discord) return msg.reply('Please link your discord ingame. tutorial: https://www.youtube.com/watch?v=LiUcDhLjLDc');
    if(result.discord!==msg.author.tag) return msg.reply('Your discord set ingame does not match!');

    //Give message based on alias used
    if(verify) msg.reply("You have been verified!");
    else msg.reply("Your prestige role has been updated!");
    
    //Remove existing prestige roles and add the new one
    await gmrm.remove(gmrm.cache.filter(p => /^Prestige/.test(p.name) && p.id !== TradeCenter.PrestigeRoles[result.prestige] ))
    await gmrm.add(TradeCenter.PrestigeRoles[result.prestige],"Bot Prestige Role");

    //only attempt to add verified role if they do not already have
    if(!msg.member.roles.cache.get(TradeCenter.Verified))
    gmrm.add(TradeCenter.Verified,"Bot Verification");

    //attempt to set their nick to their ign
    if(msg.member.displayName!==result.username) msg.member.setNickname(result.username,"Updating nick to their ingame name")
        .catch(err=>msg.reply(`Please update your discord to reflect your ingame name. \`${result.username}\``));
    
    const user = new DiscordUser({
        _id: msg.author.id,
        uuid: result.uuid
    });
    
    DiscordUser.findOneAndUpdate({_id:msg.author.id},{$set:user},{upsert:true}).catch(console.error);
}

module.exports = new Command(
    {
        name:'verify',
        fn:command,
        description:'Verify & Update your roles in the discord',
        example:`**$verify [ign]**`,
        aliases:['prestige']
    }
);