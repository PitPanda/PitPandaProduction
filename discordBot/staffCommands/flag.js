const Command = require('../Command');
const Player = require('../../models/Player');
const getDoc = require('../../apiTools/playerDocRequest');
const { MessageEmbed } = require('discord.js');

function command(msg,rest,_,permlevel){
    if(rest.length<2) return msg.reply('Insufficient parameters');
    let flag;
    let altsPromise;
    if(typeof rest[3] !== 'undefined'){
        let jsonString = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
        try{
            flag=JSON.parse(jsonString);
            if(!flag.type) return msg.reply('You didnt tell me what type of flag this is');
            flag.type=flag.type.toLowerCase();
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
    if(!altsPromise)altsPromise=Promise.all([]);
    const methods = {
        add:Doc=>{
            if(Doc.flag) msg.reply('This player is already flagged, please remove them before updating!');
            else {
                altsPromise.then(altDocs=>{
                    flag.alts=altDocs.map(alt=>alt._id);
                    Player.updateOne({_id:Doc._id},{flag}).then(results=>{
                        if(results.n) {
                            if(results.nModified) {
                                const altflag = {
                                    type:flag.type,
                                    discordid:flag.discordid,
                                    main:Doc._id,
                                    notes:flag.notes,
                                    timestamp:flag.timestamp,
                                    addedby: flag.addedby,
                                    evidence: flag.evidence
                                }
                                Promise.all(altDocs.map(({_id})=>Player.updateOne({_id},{flag:altflag}))).then(results2=>{
                                    msg.reply(`Successfully marked https://pitpanda.rocks/players/${Doc._id}`);
                                });
                                
                            } else msg.reply('Honestly I dont know if its possible to reach this reply, if it ever happens something very weird has happened. please tell mcpqndq.');
                        }
                        else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
                    })
                });
            }
        },
        remove:Doc=>{
            if(!Doc.flag) msg.reply('This player isnt even a flagged what are you doing fool');
            else Player.updateOne({_id:Doc._id},{$unset:{flag:""}}).then(results=>{
                if(results.n) {
                    if(results.nModified){
                        if(Doc.flag.alts) Promise.all(Doc.flag.alts.map(alt=>Player.updateOne({_id:alt},{$unset:{flag:""}})))
                            .then(()=>msg.reply(`Successfully unmarked https://pitpanda.rocks/players/${Doc._id}`));
                        else if(Doc.flag.main) Player.updateOne({_id:Doc.flag.main},{$pull:{"flag.alts":Doc._id}})
                            .then(()=>msg.reply(`Successfully unmarked https://pitpanda.rocks/players/${Doc._id}`));
                        else msg.reply(`Successfully unmarked https://pitpanda.rocks/players/${Doc._id}`);
                    } else msg.reply('Honestly I dont know if its possible to reach this reply, if it ever happens something very weird has happened. please tell mcpqndq.');
                }
                else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
            });
        },
        inspect: async Doc=>{
            if(Doc.error) return msg.reply(`An error occured: ${Doc.error}`);
            if(!Doc.flag) return msg.reply('This player isnt even flagged what are you doing fool');
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
    getActualDoc(rest[1].toLowerCase()).then(methods[rest[0].toLowerCase()]);
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