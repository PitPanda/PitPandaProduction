const Command = require('../Command');
const getDoc = require('../../apiTools/playerDocRequest');
const { MessageEmbed } = require('discord.js');

const command = async (msg,rest) => {
    if(!rest[0]) msg.reply('Please provide a username');
    const doc = await getDoc(rest[0]);
    if(doc.error) return msg.reply(`An error has occured: ${doc.error}`);
    const name = doc.displayName.replace(/§./g,'');
    if(!doc.scammer) return msg.reply(`${name} has not been marked as a scammer.`);
    msg.reply(`This player has been marked as a scammer for: \`${doc.scammer.notes}\``);
}

module.exports = new Command(
    {
        name:'scammer',
        fn:command,
        description:'Check if a player is a scammer',
        example:`**$scammer [ign]**`
    }
);