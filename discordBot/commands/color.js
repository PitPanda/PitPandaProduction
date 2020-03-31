const TradeCenter = require('../TradeCenter.json');
const Command = require('../Command');

const command = async (msg,rest) => {
    const color = rest[0].toUpperCase().split('').filter(c=>/^[0-9A-F]$/.test(c)).join('');
    const roleManager = msg.member.roles;
    if(!(/^#?[0-9A-F]{6}$/.test(color))) return msg.reply('Please give a color in hex format ex: #00ff00');
    const roles = roleManager.cache.filter(role=>/^#[0-9A-F]{6}$/.test(role.name));
    await roleManager.remove(roles,'Duplicate/Old Color Role');
    await Promise.all(roles.filter(role=>role.members.array().length===0).map(role=>role.delete("Role has no remaining members")))
    const role = msg.guild.roles.cache.find(p=>p.name===`#${color}`) || await msg.guild.roles.create({
        data:{
            name: `#${color}`,
            color: color,
            position: msg.guild.roles.cache.get(TradeCenter.HexMarker).position-2,
        },
        reason:"Color role",
    })
    roleManager.add(role,'Color Bot Role');
    msg.reply('Your role has been successfully added!');
}

module.exports = new Command({
    name:'color',
    fn:command,
    description:'Set your role color. (Nitro Boosters and Staff only)',
    example:`**$color [hex]**`,
    permlevel:2
});