const Command = require('../Command');
const Player = require('../../models/Player');

function command(msg,rest){
    let cID = rest[0].split('').filter(c=>/[0-9]/.test(c)).join('');
    let embedJson = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
    console.log(embedJson);
    try{
        const embed = JSON.parse(embedJson);
        console.log(cID);
        msg.client.channels.fetch(cID)
            .then(channel=>{
                    channel.send(embed.content,embed);
                    msg.reply('Sent!');
                })
            .catch(e=>msg.reply(`Uhoh? Maybe I couldn\'t seem to find that channel? Error:\n${e}`));
    }catch(e){
        msg.reply(`Failed to parse your embed. Error:\n${e}`);
    }
}

module.exports = new Command(
    {
        name: 'embed',
        fn: command,
        description:'Send a custom embed in a target channel. Use [this](https://leovoel.github.io/embed-visualizer/) to create embeds',
        example:`**$embed [#channel] \\\`\\\`\\\`json [embed] \\\`\\\`\\\`**`,
        permlevel:7
    }
);