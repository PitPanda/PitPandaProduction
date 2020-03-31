const Command = require('../Command');
const DiscordUser = require('../../models/DiscordUser');
const { Prefix } = require('../CoreConfig.json');
const { TraderOfTheMonth } = require('../TradeCenter.json');

const commandName = 'traderofthemonth';

const groupSize = 250;

const command = async (msg, rest)=> {
    if(rest[0]!=='confirm') return msg.reply(`Confirm this action by doing \`a${Prefix}${commandName} confirm\``);
    const waitMsg = msg.reply('This may take a sec');
    let bestscore = 0;
    let bestid;
    let userCount = await DiscordUser.estimatedDocumentCount();
    for(let i = 0; i < userCount/groupSize; i++){
        const users = await DiscordUser.find({}).skip(i*groupSize).limit(groupSize);
        for(const user of users){
            const newCount = user.reps?user.reps.length:0;
            const score = newCount-user.lastCount;
            user.lastCount = newCount;
            user.save();
            if(score>=bestscore){
                bestscore = score;
                bestid = user._id;
            }
        }
    }
    const role = await msg.guild.roles.fetch(TraderOfTheMonth);
    await role.members.map(member=>member.roles.remove(role));
    const winner = await msg.guild.members.fetch(bestid);
    winner.roles.add(role);
    msg.reply(`${winner} won this month.`);
    waitMsg.then(m=>m.delete());
}

module.exports = new Command({
    name:commandName,
    fn:command,
    description:'Declare the trader of the month',
    example:`**$${commandName}**`,
    permlevel: 8
});