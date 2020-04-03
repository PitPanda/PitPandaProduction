const Discord = require('discord.js');
const client = new Discord.Client();
const Config = require('./CoreConfig.json');
const TradeCenter = require('./TradeCenter.json');
const commands = require('./commands');
const staffCommands = require('./staffCommands');
const botAdminCommands = require('./botAdminCommands');
const { invalidPermissions, getPermissionLevel } = require('./permissions');
const { Development } = require('../settings.json');

if(!Development){
    client.on('guildMemberAdd',member=>{
        if(member.user.bot) return;
        client.channels.fetch(TradeCenter.WelcomeChannel).then(channel=>channel.send(
            `Welcome to Trade Center, ${member}!\n`+
            ` - Be sure to read <#${TradeCenter.RulesChannel}>!\n`+
            ` - Want to know more about the server? Check <#${TradeCenter.InfoChannel}>!\n`+
            ` - Check <#${TradeCenter.RolesChannel}> to see all of our custom roles!`
        )).catch(console.err);
    });
}

client.on('guildMemberUpdate', (oldMem, newMem) => {
    if(oldMem.roles.cache.get(TradeCenter.Nitro) && !newMem.roles.cache.get(TradeCenter.Nitro) && !newMem.roles.cache.get(TradeCenter.Staff)){
        let roles = newMem.roles.cache.filter(role=>/^#[0-9a-fA-F]{6}$/.test(role.name));
        newMem.roles.remove(roles,'Expired Nitro');
    }
});

client.on('message',msg=>{
    const content = msg.content.replace(/@(here|everyone)/gi,'stopbro');
    let userPerms = getPermissionLevel(msg);
    if(userPerms < 8 && /discord\.gg\/[a-zA-Z]{1,}/i.test(msg.content)) msg.delete();

    let state;
    if(content.startsWith(Config.Prefix)) state = {
        commandList:commands,
        minimumPerm: 0,
        prefix:Config.Prefix
    };
    else if(content.startsWith(`s${Config.Prefix}`)) state = {
        commandList:staffCommands,
        minimumPerm: 3,
        prefix:`s${Config.Prefix}`
    };
    else if(content.startsWith(`a${Config.Prefix}`)) state = {
        commandList:botAdminCommands,
        minimumPerm: 8,
        prefix:`a${Config.Prefix}`
    };
    else return;
    
    if(userPerms<state.minimumPerm) return msg.reply('You do not have permission to use these commands!');

    let [command, ...args] = getArgs(content,state.prefix);

    if(command==='help'){
        let embed = new Discord.MessageEmbed()
            .setTitle('Trade Center Bot usage')
            .setColor('#9040ff');
        for(const cmd of state.commandList){
            embed.addField(cmd.example.replace('$',state.prefix),cmd.description.replace('$',state.prefix));
        }
        embed.addField(`**${state.prefix}help**`,'This menu');
        msg.channel.send(embed);
    } else for(const cmd of state.commandList){
        if(cmd.aliases.includes(command)){
            if(cmd.permission>userPerms) return invalidPermissions(msg,cmd.permission,userPerms);
            cmd.fn(msg,args,command,userPerms);
            break;
        }
    }
});

function getArgs(content,prefix){
    return content.substring(prefix.length).toLowerCase().replace(/\s{1,}/g,' ').split(/\s/);
}

client.login(Config.Token);