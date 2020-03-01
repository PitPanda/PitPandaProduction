const {RichEmbed} = require('discord.js');
const {Prefix} = require('../CoreConfig.json');
const Command = require('./Command');
const tools = require('../botTools');

function command(msg){
    let embed = new RichEmbed()
        .setTitle('Trade Center Bot usage')
        .setColor('#9040ff');
    for(const cmd of require('../commandList')){
        if(!cmd.info.staff || tools.isStaff(msg)) embed.addField(cmd.info.example.replace('$',Prefix),cmd.info.description);
    }
    msg.channel.send(embed);
}

module.exports = new Command(
    'help',
    command,
    {
        description:'See command usage',
        example:`**$help**`
    }
);