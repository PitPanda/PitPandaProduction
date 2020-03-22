const Discord = require('discord.js');
const client = new Discord.Client();
const Config = require('./CoreConfig.json');
const TradeCenter = require('./TradeCenter.json');
const commands = require('./commandList');
const staffCommands = require('./staffCommandList');
const mcpqndqCommands = require('./mcpqndqCommandList');
const {invalidPermissions,getPermissionLevel} = require('./permissions');

client.on('guildMemberAdd',member=>{
    client.channels.fetch(TradeCenter.WelcomeChannel).then(channel=>channel.send(
        `Welcome to Trade Center, ${member}!\n`+
        ` - Be sure to read <#${TradeCenter.RulesChannel}>!\n`+
        ` - Want to know more about the server? Check <#${TradeCenter.InfoChannel}>!\n`+
        ` - Check <#${TradeCenter.RolesChannel}> to see all of our custom roles!`
    )).catch(console.err);
    member.roles.add(TradeCenter.Member);
});

client.on('message',msg=>{
    let state;
    if(msg.content.startsWith(Config.Prefix)) state = {
        commandList:commands,
        minimumPerm: 0,
        prefix:Config.Prefix
    };
    else if(msg.content.startsWith(`s${Config.Prefix}`)) state = {
        commandList:staffCommands,
        minimumPerm: 3,
        prefix:`s${Config.Prefix}`
    };
    else if(msg.content.startsWith(`m${Config.Prefix}`)) state = {
        commandList:mcpqndqCommands,
        minimumPerm: 8,
        prefix:`m${Config.Prefix}`
    };
    else return;

    let userPerms = getPermissionLevel(msg);
    
    if(userPerms<state.minimumPerm) return msg.reply('You do not have permission to use these commands!');

    let [command, ...args] = getArgs(msg,state.prefix);

    let executed = false;
    if(command==='help'){
        let embed = new Discord.MessageEmbed()
            .setTitle('Trade Center Bot usage')
            .setColor('#9040ff');
        for(const cmd of state.commandList){
            embed.addField(cmd.example.replace('$',state.prefix),cmd.description.replace('$',state.prefix));
        }
        embed.addField(`**${state.prefix}help**`,'This menu');
        msg.channel.send(embed);
        executed=true;
    } else for(const cmd of state.commandList){
        if(cmd.aliases.includes(command)){
            if(cmd.permission>userPerms) return invalidPermissions(msg,cmd.permission,userPerms);
            cmd.fn(msg,args,command,userPerms);
            executed = true;
            break;
        }
    }
    if(!executed){
        msg.reply(`I'm not sure what you are trying to do?`);
    }
});

function getArgs(msg,prefix){
    return msg.content.substring(prefix.length).toLowerCase().replace(/  /g,' ').split(/\s/);
}

client.login(Config.Token);