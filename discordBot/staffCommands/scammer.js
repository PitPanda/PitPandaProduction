const Command = require('../Command');
const Player = require('../../models/Player');
const getDoc = require('../../apiTools/playerDocRequest');

function command(msg,rest,_,permlevel){
    if(rest.length<2) return msg.reply('Insufficient parameters');
    let scammer;
    let altsPromise;
    if(typeof rest[2] !== 'undefined'){
        let jsonString = msg.content.substring(msg.content.indexOf("```json\n")+8,msg.content.lastIndexOf("```"));
        try{
            scammer=JSON.parse(jsonString);
            if(scammer.alts) {
                scammer.alts=scammer.alts.map(alt=>alt.replace(/[-\s]/g,''));
                altsPromise = Promise.all(scammer.alts.map(getActualDoc));
            }
        }catch(e){
            return msg.reply(`Uhoh failed to understand your JSON input error:\n${e}`);
        }
    }
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
                                    notes:scammer.notes
                                }
                                Promise.all(altDocs.map(({_id})=>Player.updateOne({_id},{scammer:altScammer}))).then(results2=>{
                                    msg.reply('Successfully marked them as a scammer');
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
                            .then(()=>msg.reply('Successfully unmarked them as a scammer'));
                        else if(Doc.scammer.main) Player.updateOne({_id:Doc.scammer.main},{$pull:{"scammer.alts":Doc.id}})
                            .then(()=>msg.reply('Successfully unmarked them as a scammer'));
                        else msg.reply('Successfully unmarked them as a scammer');
                    } else msg.reply('I found that player, but they were not a scammer already');
                }
                else msg.reply('I couldn\'t find that player, maybe they haven\'t been searched on pitpanda before?');
            });
        }
    }
    if(!methods[rest[0]]) return msg.reply(`unknown subcommand \`${rest[0]}\``);
    getActualDoc(rest[1]).then(methods[rest[0]]);
}

function getActualDoc(tag){
    return new Promise(resolve=>{
        getDoc(tag.replace(/[-\s]/g,''), Infinity).then(Doc=>{
            if(Doc.cached) resolve(Doc)
            else Player.findOne({_id:Doc._id}).then(resolve);
        });
    });
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
        example:`**$scammer (add|remove) [uuid]**`,
        permlevel:7
    }
);