const Command = require('../Command');
const Player = require('../../models/Player');
const getDoc = require('../../apiTools/playerDocRequest');
const { MessageEmbed } = require('discord.js');

async function command(msg,rest,_,permlevel){
    if(rest.length<2) return msg.reply('Insufficient parameters');
    let flag;
    let altsPromise = new Promise(r=>r());
    if(typeof rest[3] !== 'undefined'){
        let jsonString = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
        try{
            flag=JSON.parse(jsonString);
            if(flag.type) flag.type=flag.type.toLowerCase();
            flag.timestamp=Date.now();
            flag.addedby=msg.author.id;
            if(flag.alts) {
                flag.alts=flag.alts.map(alt=>alt.replace(/[-\s]/g,''));
                altsPromise = Promise.all(flag.alts.map(getActualDoc));
            }
        }catch(e){
            return msg.reply(`Uhoh failed to understand your JSON input error:\n${e}`);
        }
    }

    const Doc = await getActualDoc(rest[1].toLowerCase());

    const methods = {
        async add(){
            if(!flag.type) return msg.reply('You didn\'t tell me what type of flag this is');
            const altDocs = await altsPromise
            if(altDocs) flag.alts=altDocs.map(alt=>alt._id);
            const results = await Player.updateOne({_id:Doc._id},{flag});

            if(results.matchedCount > 0 && results.modifiedCount > 0) {
                msg.reply(`Successfully marked https://pitpanda.rocks/players/${Doc._id}`);
            } else {
                msg.reply('I couldn\'t find that player; maybe they haven\'t been searched on Pit Panda before?');
            }
        },
        async adjust(){
            if(!Doc.flag) return msg.reply('This command can only be used on already marked players');
            const altDocs = await altsPromise
            if(altDocs) flag.alts=altDocs.map(alt=>alt._id);
            Doc.flag = { ...Doc.toJSON().flag, ...flag };
            await Doc.save();
            msg.reply(`Updated https://pitpanda.rocks/players/${Doc._id}`);
        },
        async remove(){
            if(!Doc.flag) return msg.reply('This isn\'t even a flagged player; what are you doing?');
            const results = await Player.updateOne({_id:Doc._id},{$unset:{flag:""}})
            if(results.matchedCount > 0 && results.modifiedCount > 0) msg.reply(`Successfully unmarked https://pitpanda.rocks/players/${Doc._id}`);
            else msg.reply('I couldn\'t find that player; maybe they haven\'t been searched on Pit Panda before?');
        },
        async inspect(){
            if(Doc.error) return msg.reply(`An error occured: ${Doc.error}`);
            if(!Doc.flag) return msg.reply('This isn\'t even a flagged player; what are you doing?');
            const flag = Doc.flag;
            let embed = new MessageEmbed()
                .setTitle(Doc.displayName.replace(/§./g,''))
                .setURL(`https://pitpanda.rocks/players/${Doc._id}`)
                .setColor((Doc.hatColor)?Number(Doc.hatColor).toString(16):'9040ff')
                .addField('Type',flag.type)
                .addField('Comment',flag.notes)
                .addField('Evidence',flag.evidence||'None')
                .addField('Marked by',`<@${flag.addedby}>`)
                .addField('Added on', flag.timestamp.toLocaleString());
            if(flag.discordid) embed.addField('Discord', `<@${flag.discordid}>`);
            if(flag.main) {
                const main = await getActualDoc(flag.main);
                embed.addField('Main', main.displayName.replace(/§./g,''));
            }
            if(flag.alts&&flag.alts.length){
                const alts = await Promise.all(flag.alts.map(getActualDoc));
                embed.addField('Alts',alts.map(d=>d.name).join(', '))
            }
            msg.channel.send(embed);
        }
    }
    if(!methods[rest[0].toLowerCase()]) return msg.reply(`unknown subcommand \`${rest[0].toLowerCase()}\``);
    methods[rest[0]]();
}

function getActualDoc(tag){
    return getDoc(tag.replace(/[-\s]/g,''), {maxAge:Infinity});
}

module.exports = new Command(
    {
        name: 'flag',
        fn: command,
        description:'Mark an ingame player with a warning on pitpanda',
        example:`**$flag (add|remove|inspect) [uuid]**`,
        type: 'tradecenter',
        permlevel:7
    }
);
