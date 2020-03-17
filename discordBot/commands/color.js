const TradeCenter = require('../TradeCenter.json');
const Command = require('../Command');

function command(msg,rest){
    const color = rest[0];
    const roleManager = msg.member.roles;
    if(/^#?[0-9a-fA-F]{6}$/.test(color)){
        if(color.startsWith('#'))color=color.substring(1);
        const resolve = (role) => {
            roleManager.add(role,'Color Bot Role');
            msg.reply('Your role has been successfully added!');
        }
        let roles = roleManager.cache.filter(role=>/^#[0-9a-fA-F]{6}$/.test(role.name));
        roleManager.remove(roles,'Duplicate/Old Color Role').then(()=>{
            Promise.all(roles.filter(role=>role.members.array().length===0).map(role=>role.delete("Role has no remaining members"))).then(()=>{
                const role = msg.guild.roles.cache.find(p=>p.name===`#${color}`);
                if(role) resolve(role);
                else msg.guild.roles.create({
                    data:{
                        name: `#${color}`,
                        color: color,
                        position: msg.guild.roles.cache.get(TradeCenter.HexMarker).position-2
                    },
                    reason:"Color role"
                }).then(resolve);
            });
        });
    } else msg.reply('Please give a color in hex format ex: #00ff00');
}

module.exports = new Command({
    name:'color',
    fn:command,
    description:'Set your role color. (Nitro Boosters and Staff only)',
    example:`**$color [######]**`,
    permlevel:2
});