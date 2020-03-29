const Discord = require('discord.js');
const rss_parser = require('rss-parser');
const parser = new rss_parser();
const { EventWebHook } = require('../settings.json');
const mentionHook = new Discord.WebhookClient(...EventWebHook);
const ForumsPost = require('../models/ForumsPost');
const getDoc = require('../apiTools/playerDocRequest');

let lastGroup = [];

function readRss(){
    parser.parseURL('https://hypixel.net/forums/game-the-pit.151/index.rss').then(async feed=>{
        for(const item of feed.items){
            if(lastGroup.some(m=>m.link===item.link)) continue;
            const _id = Number(item.link.substr(item.link.length-8,7));
            const timestamp = Date.parse(item.isoDate);
            const link = item.link;
            const title = item.title;
            const author = item.creator;
            const doc = new ForumsPost({_id,timestamp,link,title,author});
            const previous = await ForumsPost.findByIdAndUpdate(_id, doc, { upsert: true });
            if(!previous){
                const doc = await getDoc(author);
                mentionHook.send(
                    new Discord.MessageEmbed()
                        .setColor((doc.hatColor)?Number(doc.hatColor).toString(16):'ffaa00')
                        .setTitle(title)
                        .setURL(link)
                        .setFooter(`by: ${author}`)
                        .setTimestamp(timestamp)
                );
            }
        }
        lastGroup = feed.items;
        setTimeout(readRss, 20e3);
    }).catch(err=>{
        console.log('Uh oh, will try again in 10 minutes.',err.message);
        setTimeout(readRss, 600e3);
    });
}
readRss();