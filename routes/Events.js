const router = require('express').Router();
const {WebhookClient, MessageEmbed} = require('discord.js');
const {EventWebHook} = require('../settings.json');
const hook = new WebhookClient(...EventWebHook);
const EventKey = require('../models/EventKey');
const EventLog = require('../models/EventLog');

const rgx = /^(§r)?§(d|5)§l(MINOR|MAJOR|FAKE) EVENT! (§r)?§.§l[ A-Z0-9]{1,}/;

const major = {
    name: 'major',
    role: '694629838555971675',
    color: '#fac400',
};

const minor = {
    name: 'minor',
    role: '694629832000012298',
    color: '#9040ff',
};

const events = {
    'FAKE EVENT! THIS IS TEST':{
        ignore: true,
        degree: {
            name: 'fake',
            role: 'no one',
            color: '#9040ff',
        },
        type: {
            name: 'test',
            role: 'no one',
        },
    },
    'MAJOR EVENT! SPIRE':{
        degree: major,
        type: {
            name: 'spire',
            role: '694629841982455899',
        },
    },
    'MAJOR EVENT! BLOCKHEAD':{
        degree: major,
        type: {
            name: 'blockhead',
            role: '694631014881951887',
        },
    },
    'MAJOR EVENT! BEAST':{
        degree: major,
        type: {
            name: 'beast',
            role: '694629844671266826',
        },
    },
    'MAJOR EVENT! RAGE PIT':{
        degree: major,
        type: {
            name: 'ragepit',
            role: '694629847271604324',
        },
    },
    'MAJOR EVENT! SQUADS':{
        degree: major,
        type: {
            name: 'squads',
            role: '694629851059060857',
        },
    },
    'MAJOR EVENT! RAFFLE':{
        degree: major,
        type: {
            name: 'raffle',
            role: '694629859707846737',
        },
    },
    'MAJOR EVENT! ROBBERY':{
        degree: major,
        type: {
            name: 'robbery',
            role: '694629863352696902',
        },
    },
    'MAJOR EVENT! TEAM DEATHMATCH':{
        degree: major,
        type: {
            name: 'tdm',
            role: '694644007585710192',
        },
    },
    'MAJOR EVENT! PIZZA':{
        degree: major,
        type: {
            name: 'pizza',
            role: '694644010794352671',
        },
    },
    'MINOR EVENT! KOTH':{
        degree: minor,
        type: {
            name: 'koth',
            role: '694629867135696906',
        },
    },
    'MINOR EVENT! DRAGON EGG':{
        degree: minor,
        type: {
            name: 'dragon',
            role: '694629869899743292',
        },
    },
    'MINOR EVENT! CARE PACKAGE':{
        degree: minor,
        type: {
            name: 'package',
            role: '694629873506975834',
        },
    },
    'MINOR EVENT! KOTL':{
        degree: minor,
        type: {
            name: 'kotl',
            role: '694629881056854086',
        },
    },
    'MINOR EVENT! 2X REWARDS':{
        degree: minor,
        type: {
            name: 'double',
            role: '694629882818330746',
        },
    },
    'MINOR EVENT! AUCTION!':{
        degree: minor,
        type: {
            name: 'auction',
            role: '694629910991601717',
        },
    },
    'MINOR EVENT! GIANT CAKE':{
        degree: minor,
        type: {
            name: 'cake',
            role: '694629913545932820',
        },
    },
    'MINOR EVENT! EVERYONE GETS A BOUNTY!':{
        degree: minor,
        type: {
            name: 'bounty',
            role: '694630567148388392',
        },
    },
};

let lastevent;
let lastevent_id;
/**
 * @type {Set<String>}
 */
let lastreporters = new Set();

const feed = {
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

router.post('/', async (req,res)=>{
    res.status(200).json({success:true});
    if(!req.headers.key) return;
    const keyDoc = await EventKey.findById({_id:req.headers.key});
    if(!keyDoc) return console.log('invalid key');
    const final = req.headers.eventtype;
    if(rgx.test(final)){
        let end = final.indexOf('§7');
        if(end===-1)end=final.length;
        const clean = final.substring(0,end).replace(/§./g,'').trim();
        const event = events[clean];
        if(!event) return console.log(`!!!!!!! something that did not classify was submitted to events: ${clean}`);
        if(event===lastevent) return lastreporters.add(keyDoc.owner);
        if(lastevent_id) EventLog.findByIdAndUpdate(lastevent_id, {$set:{coreporters: [...lastreporters]}}).then(()=>{});
        lastreporters = new Set([keyDoc.owner]);
        lastevent = event;
        const eventLog = new EventLog({
            reporter: keyDoc.owner,
            event: clean,
            degree: event.degree.name,
            type: event.type.name,
        });
        eventLog.save((err,final)=>{
            if(err) return;
            lastevent_id = final._id;
            if(!event.ignore) hook.send(
                `<@&${event.degree.role}> <@&${event.type.role}>`,
                new MessageEmbed()
                    .setTitle(clean)
                    .setColor(event.degree.color)
                    .setFooter(final._id)
                    .setTimestamp()
            );
            feed.emit({
                degree: event.degree.name,
                type: event.type.name,
            });
        });
    }
});

router.ws('/', (ws) => {
    const listener = feed.subscribe(event => ws.send(JSON.stringify(event)));
    ws.on('close', listener.kill.bind(listener));
    ws.on('message', ()=>ws.send('3'));
});

router.use('/', (req,res)=>{
    res.status(200).json({});
});

module.exports = router;