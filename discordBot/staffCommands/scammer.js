const Command = require('../Command');
const Player = require('../../models/Player');
const getDoc = require('../../apiTools/playerDocRequest');
const { MessageEmbed } = require('discord.js');

function command(msg,rest,_,permlevel){
    if(rest.length<2) return msg.reply('Insufficient parameters');
    let scammer;
    let altsPromise;
    if(typeof rest[2] !== 'undefined'){
        let jsonString = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
        try{
            scammer=JSON.parse(jsonString);
            scammer.timestamp=Date.now();
            scammer.addedby=msg.author.id;
            if(scammer.alts) {
                scammer.alts=scammer.alts.map(alt=>alt.replace(/[-\s]/g,''));
                altsPromise = Promise.all(scammer.alts.map(getActualDoc));
            }
        }catch(e){
            return msg.reply(`Uhoh failed to understand your JSON input error:\n${e}`);
        }
    }
    if(!altsPromise)altsPromise=Promise.all([]);
    const methods = {
        add:Doc=>{
            if(Doc.scammer) msg.reply('This player is already a scammer, please remove them before updating!');
            else {
                altsPromise.then(altDocs=>{
                    scammer.alts=altDocs.map(alt=>alt._id);
                    Player.updateOne({_id:Doc.id},{scammer}).then(results=>{
                        if(results.n) {
                            if(results.nModified) {
                                const altScammer = {
                                    discordid:scammer.discordid,
                                    main:Doc.id,
                                    notes:scammer.notes,
                                    timestamp:scammer.timestamp,
                                    addedby: scammer.addedby,
                                    evidence: scammer.evidence
                                }
                                Promise.all(altDocs.map(({_id})=>Player.updateOne({_id},{scammer:altScammer}))).then(results2=>{
                                    msg.reply(`Successfully marked them as a scammer  https://pitpanda.rocks/players/${Doc._id}`);
                                });
                                
                            } else msg.reply('I found that player, but they were already marked as a scammer');
                        }
                        else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
                    })
                });
            }
        },
        remove:Doc=>{
            if(!Doc.scammer) msg.reply('This player isnt even a scammer what are you doing fool');
            else Player.updateOne({_id:Doc._id},{$unset:{scammer:""}}).then(results=>{
                if(results.n) {
                    if(results.nModified){
                        if(Doc.scammer.alts) Promise.all(Doc.scammer.alts.map(alt=>Player.updateOne({_id:alt},{$unset:{scammer:""}})))
                            .then(()=>msg.reply(`Successfully unmarked them as a scammer https://pitpanda.rocks/players/${Doc._id}`));
                        else if(Doc.scammer.main) Player.updateOne({_id:Doc.scammer.main},{$pull:{"scammer.alts":Doc.id}})
                            .then(()=>msg.reply(`Successfully unmarked them as a scammer https://pitpanda.rocks/players/${Doc._id}`));
                        else msg.reply('Successfully unmarked them as a scammer');
                    } else msg.reply('I found that player, but they were not a scammer already');
                }
                else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
            });
        },
        inspect: async Doc=>{
            if(Doc.error) return msg.reply(`An error occured: ${Doc.error}`);
            if(!Doc.scammer) return msg.reply('This player isnt even a scammer what are you doing fool');
            const scammer = Doc.scammer;
            let embed = new MessageEmbed()
                .setTitle(Doc.displayName.replace(/§./g,''))
                .setURL(`https://pitpanda.rocks/players/${Doc._id}`)
                .setColor((Doc.hatColor)?Number(Doc.hatColor).toString(16):'9040ff')
                .addField('Comment',scammer.notes)
                .addField('Evidence',scammer.evidence||'None')
                .addField('Marked by',`<@${scammer.addedby}>`)
                .addField('Added on', scammer.timestamp.toLocaleString());
            if(scammer.discordid) embed.addField('Scammer\'s discord', `<@${scammer.discordid}>`);
            if(scammer.main) {
                const main = await getActualDoc(scammer.main);
                embed.addField('Main', main.displayName.replace(/§./g,''));
            }
            if(scammer.alts&&scammer.alts.length){
                const alts = await Promise.all(scammer.alts.map(getActualDoc));
                embed.addField('Alts',alts.map(d=>d.name).join(', '))
            }
            msg.channel.send(embed);
        }
    }
    if(!methods[rest[0]]) return msg.reply(`unknown subcommand \`${rest[0]}\``);
    getActualDoc(rest[1]).then(methods[rest[0]]);
}

function getActualDoc(tag){
    return getDoc(tag.replace(/[-\s]/g,''), {maxAge:Infinity});
}

function markAlt(uuid, scammer){
    return new Promise(resolve=>{
        getDoc(uuid).then(Doc=>{
            Player.updateOne({_id:Doc._id},{scammer}).then(resolve)
        });
    });
}

module.exports = new Command(
    {
        name: 'scammer',
        fn: command,
        description:'Mark an ingame player as a scammer on pitpanda',
        example:`**$scammer (add|remove|inspect) [uuid]**`,
        permlevel:7
    }
);