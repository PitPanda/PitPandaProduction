const TradeCenter = require('./TradeCenter.json');
const Discord = require('discord.js');
const Discorduser = require('../models/DiscordUser');
const PlayerDoc = require('../apiTools/playerDocRequest');

function getStaffPermissionLevel(member){
    if(member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) return 8;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Senior)) return 7;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Moderator)) return 6;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Junior)) return 5;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Trial)) return 4;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Staff)) return 3;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Nitro)) return 2;
    if(member.roles.cache.some(role=>role.id===TradeCenter.Verified)) return 1;
    return 0;
}

function permission(member){
    if(!member) return ()=>false;
    return async (type, level) => {
        if(member.bot || TradeCenter.BotAdmins.includes(member.id)) return true;
        switch(type){
            case 'tradecenter':{
                return getStaffPermissionLevel(member) >= level;
            }
            case 'pitpanda':{
                if(!level) return true;
                if(TradeCenter.PitPandaAdmins.includes(member.id)) return true;
                if(level === 1){
                    if(getStaffPermissionLevel(member) > 7) return true;
                    const user = await Discorduser.findById(member.id);
                    if(!user || !user.uuid) return false;
                    const doc = await PlayerDoc(user.uuid);
                    return doc.discord === member.user.tag && doc.special;
                }
            }
        }
        return false;
    }
}

module.exports = permission;