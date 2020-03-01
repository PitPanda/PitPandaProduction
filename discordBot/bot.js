const Discord = require('discord.js');
const client = new Discord.Client();
const TradeCenter = require('./TradeCenter.json');
const Config = require('./CoreConfig.json');
const commands = require('./commandList');

client.on('message',msg=>{
    if(!msg.content.startsWith(Config.Prefix))return;
    const [command, ...rest] = msg.content.substring(Config.Prefix.length).toLowerCase().replace(/  /g,' ').split(' ');
    for(const cmd of commands){
        if(cmd.aliases.includes(command)){
            cmd.fn(msg,rest,command);
            break;
        }
    }
});

client.login(Config.Token);