const Discord = require('discord.js');
const client = new Discord.Client();
const Config = require('./CoreConfig.json');
const TradeCenter = require('./TradeCenter.json');
const commands = require('./commands');
const staffCommands = require('./staffCommands');
const botAdminCommands = require('./botAdminCommands');
const pitPandaAdminCommands = require('./pitPandaAdminCommands');
const { Development } = require('../settings.json');
const permission = require('./Permission');

if(!Development){
    client.on('guildMemberAdd',member=>{
        if(member.user.bot) return;
        client.channels.fetch(TradeCenter.WelcomeChannel).then(channel=>channel.send(
            `Welcome to Trade Center, ${member}!\n`+
            ` - Be sure to read <#${TradeCenter.RulesChannel}>!\n`+
            ` - Want to know more about the server? Check <#${TradeCenter.InfoChannel}>!\n`+
            ` - Check <#${TradeCenter.RolesChannel}> to see all of our custom roles!`
        )).catch(console.error);
    });
}

client.on('guildMemberUpdate', (oldMem, newMem) => {
    if(oldMem.roles.cache.get(TradeCenter.Nitro) && !newMem.roles.cache.get(TradeCenter.Nitro) && !newMem.roles.cache.get(TradeCenter.Staff)){
        let roles = newMem.roles.cache.filter(role=>/^#[0-9a-fA-F]{6}$/.test(role.name));
        newMem.roles.remove(roles,'Expired Nitro');
    }
});

client.on('message',async msg=>{
    const content = msg.content.replace(/(@(here|everyone))|(<@&[0-9]{1,}>)/gi,'stopbro');
    let perms = permission(msg.member);
    if(!await perms('tradecenter',8) && /discord\.gg\/[a-z0-9]{1,}/i.test(msg.content)) return msg.delete();

    let state;
    if(content.startsWith(Config.Prefix)) state = {
        commandList:commands,
        minimumPerm: 0,
        type: 'tradecenter',
        prefix:Config.Prefix
    };
    else if(content.startsWith(`s${Config.Prefix}`)) state = {
        commandList:staffCommands,
        minimumPerm: 3,
        type: 'tradecenter',
        prefix:`s${Config.Prefix}`
    };
    else if(content.startsWith(`a${Config.Prefix}`)) state = {
        commandList:botAdminCommands,
        minimumPerm: 8,
        type: 'tradecenter',
        prefix:`a${Config.Prefix}`
    };
    else if(content.startsWith(`p${Config.Prefix}`)) state = {
        commandList:pitPandaAdminCommands,
        minimumPerm: 1,
        type: 'pitpanda',
        prefix:`p${Config.Prefix}`
    };
    else return;
    
    if(!await perms(state.type,state.minimumPerm)) return msg.reply('You do not have permission to use these commands!');

    let [command, ...args] = getArgs(content,state.prefix);
    command = command.toLowerCase();
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
            if(!await perms(cmd.type, cmd.permission)) return msg.reply('You do not have permission to use this command!');
            cmd.fn(msg,args,command,perms);
            break;
        }
    }
});

function getArgs(content,prefix){
    return content.substring(prefix.length).replace(/\s{1,}/g,' ').split(/\s/);
}

client.login(Config.Token);