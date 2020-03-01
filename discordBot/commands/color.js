const TradeCenter = require('../TradeCenter.json');
const Command = require('./Command');

function command(msg,rest){
    const color = rest[0];
    if(msg.member.roles.some(role=>role.id===TradeCenter.Staff||role.id===TradeCenter.Nitro)){
        if(/^#?[0-9a-fA-F]{6}$/.test(color)){
            if(color.startsWith('#'))color=color.substring(1);
            const resolve = (role) => {
                msg.member.addRole(role,'Color Bot Role');
                msg.reply('Your role has been successfully added!');
            }
            let roles = msg.guild.roles.filter(role=>/^#[0-9a-fA-F]{6}$/.test(role.name));
            msg.member.removeRoles(roles,'Duplicate/Old Color Role').then(()=>{
                Promise.all(roles.filter(role=>role.members.array().length===0).deleteAll()).then(()=>{
                    const role = msg.guild.roles.find(p=>p.name===`#${color}`);
                    if(role) resolve(role);
                    else msg.guild.createRole({
                        name: `#${color}`,
                        color: color,
                        position: msg.guild.roles.array().find(p=>p.name==='#hexcolor').position-2
                    }).then(resolve);
                });
            });
        } else msg.reply('Please give a color in hex format ex: #00ff00');
    } else msg.reply('You must be a Nitro Booster or Staff to use this command!');
}

module.exports = new Command(
    'color',
    command,
    {
        description:'Set your role color. (Nitro Boosters and Staff only)',
        example:`**$color [######]**`
    }
);