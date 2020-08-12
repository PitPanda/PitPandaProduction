const Discord = require('discord.js');

/**
 * @param {Discord.Message} msg 
 * @returns {object | undefined}
 */
module.exports.parseJson = msg => {
  let jsonString = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
  try{
    return JSON.parse(jsonString);
  }catch(e){
    msg.reply(`Uhoh failed to understand your JSON input error:\n${e}`);
    return;
  }
}