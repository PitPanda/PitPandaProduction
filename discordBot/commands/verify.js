const TradeCenter = require('../TradeCenter.json');
const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');
const hypixelAPI = require('../../apiTools/playerRequest');

function command(msg,rest,alias){
    const verify = alias===`verify`;
    if(!rest[0]) return msg.reply(`Please include your username. Ex: \`.${verify?'verify':'prestige'} mcpqndq\``);
    hypixelAPI(rest[0]).then(result=>{
        if(result.error) return msg.reply(result.error);
        if(result.discord!==msg.author.tag) return msg.reply('Your discord set ingame does not match!');

        //Give message based on alias used
        if(verify) msg.reply("You have been verified!");
        else msg.reply("Your prestige role has been updated!");

        //only attempt to add verified role if they do not already have
        if(!msg.member.roles.some(p=>p.id===TradeCenter.Verified))
            msg.member.addRole(TradeCenter.Verified,"Bot Verification");
        
        //Remove existing prestige roles and add the new one
        msg.member.removeRoles(msg.member.roles.filter(p=>/^Prestige/.test(p.name)&&p.id!=TradeCenter.PrestigeRoles[result.prestige]))
            .then(member=>member.addRole(TradeCenter.PrestigeRoles[result.prestige],"Bot Prestige Role"));

        //attempt to set their nick to their ign
        if(msg.member.displayName!=result.username) msg.member.setNickname(result.username,"Updating nick to their ingame name")
            .catch(err=>msg.reply(`Please update your discord to reflect your ingame name. \`${result.username}\``));
        
        const user = new DiscordUser({
            _id: msg.author.id,
            uuid: result.uuid
        });
        console.log(user);
        DiscordUser.findOneAndUpdate({_id:msg.author.id},{$set:user},{upsert:true}).catch(console.error);
    });
}

module.exports = new Command(
    {
        name:'verify',
        fn:command,
        description:'Verify & Update your roles in the discord',
        example:`**$verify [username]**`,
        aliases:['prestige']
    }
);