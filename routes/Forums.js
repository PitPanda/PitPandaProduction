const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const Discord = require('discord.js');
const rss_parser = require('rss-parser');
const parser = new rss_parser();
const { ForumsWebHook, Development } = require('../settings.json');
const mentionHook = new Discord.WebhookClient(...ForumsWebHook);
const ForumsPost = require('../models/ForumsPost');
const getDoc = require('../apiTools/playerDocRequest');

const store = {
    subs: [],
    subscribe(callback){
        const listener = {
            callback,
            kill: () => {
                this.subs = this.subs.filter(cur=>cur!==listener);
                console.log(`An event listener left. total: ${this.subs.length}`);
            },
        };
        this.subs.push(listener);
        console.log(`A new event listener connected. total: ${this.subs.length}`);
        return listener;
    },
    emit(event){
        console.log(`Emitting event to ${this.subs.length} connected listeners`);
        this.subs.forEach(listener=>listener.callback(event));
    },
}

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
            const proto = {_id,timestamp,link,title,author};
            store.emit(proto)
            const doc = new ForumsPost(proto);
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
if(!Development) readRss();

router.ws('/', (ws) => {
    const listener = store.subscribe(event => ws.send(JSON.stringify(event)));
    ws.on('close', listener.kill.bind(listener));
    ws.on('message', ()=>ws.send('3'));
});

router.use('/', APIerror('This is a websocket only endpoint'));

module.exports = router;