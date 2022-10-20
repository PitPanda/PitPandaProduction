const Command = require('../Command');
const getDoc = require('../../apiTools/playerDocRequest');
const TradeCenter = require('../TradeCenter.json');
const { parseJson } = require('../utils');
const { MessageEmbed } = require('discord.js');

const getActualDoc = tag => getDoc(tag.toLowerCase().replace(/[-\s]/g,''), {maxAge:Infinity});

/**
 * @param {string[]} alts
 * @returns {string[]}
 */
const resolveAltUUIDs = async alts => (await Promise.all(alts.map(getActualDoc))).map(doc=>doc._id);

const methods = {
    async add(msg, doc){
        const data = parseJson(msg);
        if(data.alts) data.alts = await resolveAltUUIDs(data.alts);
        doc.profileDisplay = data;
        await doc.save();
        msg.reply(`Added https://pitpanda.rocks/players/${doc._id}`);
    },
    async adjust(msg, doc){
        if(!doc.profileDisplay) return msg.reply('This command can only be used on players who already have a display');
        const data = parseJson(msg);
        if(data.alts) data.alts = await resolveAltUUIDs(data.alts);
        doc.profileDisplay = { ...doc.toJSON().profileDisplay, ...data };
        await doc.save();
        msg.reply(`Updated https://pitpanda.rocks/players/${doc._id}`);
    },
    async addalts(msg, doc, rest){
        if(!doc.profileDisplay) return msg.reply('This command can only be used on players who already have a display');
        const toAdd = (await resolveAltUUIDs(rest)).filter(a => !doc.profileDisplay.alts || !doc.profileDisplay.alts.includes(a));
        doc.profileDisplay.alts.push(...toAdd);
        await doc.save();
        msg.reply(`Updated https://pitpanda.rocks/players/${doc._id}`);
    },
    async removealts(msg, doc, rest){
        if(!doc.profileDisplay) return msg.reply('This command can only be used on players who already have a display');
        const toRemove = await resolveAltUUIDs(rest);
        console.log(doc)
        doc.profileDisplay.alts = doc.profileDisplay.alts.filter(a => !toRemove.includes(a));
        await doc.save();
        msg.reply(`Updated https://pitpanda.rocks/players/${doc._id}`);
    },
    async sortalts(msg, doc, rest){
        if(!doc.profileDisplay) return msg.reply('This command can only be used on players who already have a display');
        if(!doc.profileDisplay.alts) return msg.reply('This command can only be used on players who have alts added');
        const alts = await Promise.all(doc.profileDisplay.alts.map(u => getActualDoc(u)));
        if(!rest[0] || rest[0] === 'xp'){
            alts.sort((a,b) => b.xp - a.xp);
        }else if(rest[0] === 'alphabetical' || rest[0] === 'alpha'){
            alts.sort((a,b) => a.nameLower < b.nameLower ? -1 : 1);
        }else{
            return msg.reply(`Unknown sorting method`);
        }
        doc.profileDisplay.alts = alts.map(a => a._id);
        await doc.save();
        msg.reply(`Updated https://pitpanda.rocks/players/${doc._id}`);
    },
    async clearerrors(msg, doc, rest){
        if(!doc.profileDisplay) return msg.reply('This command can only be used on players who already have a display');
        if(!doc.profileDisplay.alts) return msg.reply('This command can only be used on players who have alts added');
        doc.profileDisplay.alts = doc.profileDisplay.alts.filter(Boolean);
        await doc.save();
        msg.reply(`Updated https://pitpanda.rocks/players/${doc._id}`);
    },
    async remove(msg, doc){
        if(!doc.profileDisplay) return msg.reply('This player doesn\'t even have a display what are you doing fool.');
        doc.profileDisplay = undefined;
        await doc.save();
        msg.reply(`Successfully unmarked https://pitpanda.rocks/players/${doc._id}`);
    },
    async inspect(msg, doc){
        if(!doc.profileDisplay) return msg.reply('This player doesn\'t even have a display what are you doing fool.');
        const display = doc.profileDisplay;
        let embed = new MessageEmbed()
            .setTitle(doc.displayName.replace(/§./g,''))
            .setURL(`https://pitpanda.rocks/players/${doc._id}`)
            .setColor((doc.hatColor)?Number(doc.hatColor).toString(16):'9040ff')
            .addField('Title',display.title)
            .addField('Message',display.message)
        if(display.url) embed.addField('Link',display.url)
        if(display.linkTitle) embed.addField('Link Title',display.linkTitle)
        if(display.alts&&display.alts.length){
            const alts = await Promise.all(display.alts.map(getActualDoc));
            embed.addField('Alts',alts.map(d=>d.name).join(', '))
        }
        msg.channel.send(embed);
    },
    async move(msg, from, rest){
        if(!from.profileDisplay) return msg.reply('Source doesn\'t have a display you fool.');
        const to = await getActualDoc(rest[0]);
        if(to.profileDisplay) return msg.reply('Target already has a display, delete it first.');
        to.profileDisplay = from.profileDisplay;
        if(to.profileDisplay.alts) to.profileDisplay.alts = to.profileDisplay.alts.filter(a => a !== to._id);
        from.profileDisplay = undefined;
        await Promise.all([to.save(), from.save()]);
        msg.reply(`Successfully moved tag to https://pitpanda.rocks/players/${to._id}`);
    },
}

const command = async (msg,rest) => {
    if(!msg.member.roles.cache.some(role=>role.id===TradeCenter.PitPandaTagPerms)) return msg.reply("no")
    

    if(!rest[0] || !Object.keys(methods).includes(rest[0].toLowerCase())) return msg.reply(`Invalid subcommand, commands are: ${Object.keys(methods).join(', ')}`);
    if(!rest[1]) return msg.reply('But for who?');
    
    const doc = await getActualDoc(rest[1]);

    if(!doc) msg.reply('I couldn\'t find that player');

    methods[rest[0].toLowerCase()](msg, doc, rest.slice(2));

    /*
    if(!rest[0]) msg.reply('please include the username or uuid of the player you would like to edit');
    if(rest[1]==='remove') {
        let doc = await getDoc(rest[0]);
        if(doc.error) return msg.reply(`Error occured: ${doc.error}`);
        doc.profileDisplay = undefined;
        doc.save();
        return msg.reply(`Deleted https://pitpanda.rocks/players/${doc._id}`);
    }
    let profileDisplay;
    let jsonString = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
    try{
        profileDisplay=JSON.parse(jsonString);
    }catch(e){
        return msg.reply(`Uhoh failed to understand your JSON input error:\n${e}`);
    }
    let doc = await getDoc(rest[0]);
    if(doc.error) return msg.reply(`Error occured: ${doc.error}`);
    if(profileDisplay.alts){
        profileDisplay.alts = (await Promise.all(profileDisplay.alts.map(tag=>getDoc(tag,{maxAge: Infinity})))).map(d=>d._id);
    }
    doc.profileDisplay = profileDisplay;
    doc.save();
    msg.reply(`Added https://pitpanda.rocks/players/${doc._id}`);
    */
}

module.exports = new Command(
    {
        name: 'pitpandatag',
        fn: command,
        description:`Set a player's profile display on pit panda`,
        example:`**$pitpandatag [command] [uuid or name] \\\`\\\`\\\`json [info] \\\`\\\`\\\`**`,
        type: 'pitpanda',
        permlevel:0
    }
);
