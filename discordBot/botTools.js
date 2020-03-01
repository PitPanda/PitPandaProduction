const TradeCenter = require('./TradeCenter.json');

function isStaff(msg){
    return msg.member.roles.some(role=>role.id===TradeCenter.Staff);
} module.exports.isStaff = isStaff;

function isVerified(msg){
    return msg.member.roles.some(role=>role.id===TradeCenter.Verified);
} module.exports.isVerified = isVerified;