const Command = require('../Command');
const Player = require('../../models/Player');

function command(msg,rest,_,permlevel){
    if(rest.length<2) return msg.reply('You are missing something?');
    const target = rest[1].replace(/[-\s]/g,'');
    if(target.length<32) return msg.reply(`Please use the player's uuid. You can find this here hopefully. https://namemc.com/profile/${rest[1]}`);
    switch(rest[0]){
        case 'add':
            Player.updateOne({_id:target},{scammer:true}).then(results=>{
                if(results.n) {
                    if(results.nModified) msg.reply('Successfully marked them as a scammer');
                    else msg.reply('I found that player, but they were already marked as a scammer');
                }
                else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
            });
            break;
        case 'remove':
            Player.updateOne({_id:target},{scammer:false}).then(results=>{
                if(results.n) {
                    if(results.nModified) msg.reply('Successfully unmarked them as a scammer');
                    else msg.reply('I found that player, but they were not a scammer already');
                }
                else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
            });
            break;
        default:
            msg.reply(`Unknown subcommand "${rest[0]}"`);
    }
}

module.exports = new Command(
    {
        name: 'scammer',
        fn: command,
        description:'Mark an ingame player as a scammer on pitpanda',
        example:`**$scammer (add|remove) [uuid]**`,
        permlevel:7
    }
);