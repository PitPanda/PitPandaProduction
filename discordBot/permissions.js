const TradeCenter = require('./TradeCenter.json');

function invalidPermissions(msg,required,current){
    switch(required){
        case 1:
            msg.reply('You must be Verified to use this command!');
            break;
        case 2:
            msg.reply('You must be a Nitro Booster to use this command!');
            break;
        case 3:
            msg.reply('You must be Staff to use this command!');
            break;
        case 4:
            msg.reply('You must be Trial Moderator to use this command!');
            break;
        case 5:
            msg.reply('You must be Junior Moderator to use this command!');
            break;
        case 6:
            msg.reply('You must be Moderator to use this command!');
            break;
        case 7:
            msg.reply('You must be Senior Moderator to use this command!');
            break;
        case 8:
            msg.reply('You must be an Administrator to use this command!');
            break;
        default:
            msg.reply(`Permission level ${required} is required to use this command, but you only have level ${current}`);
    }
} module.exports.invalidPermissions = invalidPermissions;

function getPermissionLevel(msg){
    if(TradeCenter.BotAdmins.includes(msg.author.id)) return Infinity;
    if(msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return 8;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Senior)) return 7;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Moderator)) return 6;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Junior)) return 5;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Trial)) return 4;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Staff)) return 3;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Nitro)) return 2;
    if(msg.member.roles.some(role=>role.id===TradeCenter.Verified)) return 1;
    return 0;
} module.exports.getPermissionLevel = getPermissionLevel;