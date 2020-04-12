const TradeCenter = require('./TradeCenter.json');
const Discord = require('discord.js');

class Permission{
    constructor(member){
        this.member = member;
        if(member){
            if(member.bot || TradeCenter.BotAdmins.includes(member.id)) this.all = Infinity;
            else{
                this.tradecenter = Permission.getStaffPermissionLevel(this.member);
                if(TradeCenter.BotAdmins.includes(member.id)) this.pitpanda = 2;
                else if(this.tradecenter > 7) this.pitpanda = 1;
                else this.pitpanda = 0;
            }
        }
    }

    hasPermission(type, level){
        return (this.all || this[type] || 0) >= level;
    }

    static getStaffPermissionLevel(member){
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
}

module.exports = Permission;