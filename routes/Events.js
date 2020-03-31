const router = require('express').Router();
const {WebhookClient, MessageEmbed} = require('discord.js');
const {EventWebHook} = require('../settings.json');
const hook = new WebhookClient(...EventWebHook);
const EventKey = require('../models/EventKey');
const EventLog = require('../models/EventLog');

const rgx = /^(§r)?§(d|5)§lM(INO|AJO)R EVENT! (§r)?§.§l[ A-Z0-9]{1,}/;

const major = {
    name: 'major',
    role: 'roleformajors',
    color: 'ffffff',
};

const minor = {
    name: 'minor',
    role: 'roleforminors',
    color: '9040ff',
};

const events = {
    'MAJOR EVENT! SPIRE':{
        degree: major,
        type: {
            name: 'spire',
            role: 'roleforspire',
        },
    },
    'MAJOR EVENT! BLOCKHEAD':{
        degree: major,
        type: {
            name: 'blockhead',
            role: 'roleforblockhead',
        },
    },
    'MAJOR EVENT! BEAST':{
        degree: major,
        type: {
            name: 'beast',
            role: 'roleforbeast',
        },
    },
    'MAJOR EVENT! RAGE PIT':{
        degree: major,
        type: {
            name: 'ragepit',
            role: 'roleforragepit',
        },
    },
    'MAJOR EVENT! SQUADS':{
        degree: major,
        type: {
            name: 'squads',
            role: 'roleforsquads',
        },
    },
    'MAJOR EVENT! RAFFLE':{
        degree: major,
        type: {
            name: 'raffle',
            role: 'roleforraffle',
        },
    },
    'MAJOR EVENT! ROBBERY':{
        degree: major,
        type: {
            name: 'robbery',
            role: 'roleforrobbery',
        },
    },
    'MINOR EVENT! KOTH':{
        degree: minor,
        type: {
            name: 'koth',
            role: 'roleforkoth',
        },
    },
    'MINOR EVENT! DRAGON EGG':{
        degree: minor,
        type: {
            name: 'dragon',
            role: 'rolefordragon',
        },
    },
    'MINOR EVENT! CARE PACKAGE':{
        degree: minor,
        type: {
            name: 'package',
            role: 'roleforpackage',
        },
    },
    'MINOR EVENT! KOTL':{
        degree: minor,
        type: {
            name: 'kotl',
            role: 'roleforkotl',
        },
    },
    'MINOR EVENT! 2X REWARDS':{
        degree: minor,
        type: {
            name: 'double',
            role: 'rolefordouble',
        },
    },
    'MINOR EVENT! AUCTION!':{
        degree: minor,
        type: {
            name: 'auction',
            role: 'roleforauction',
        },
    },
    'MINOR EVENT! GIANT CAKE':{
        degree: minor,
        type: {
            name: 'caje',
            role: 'roleforcake',
        },
    },
    'MINOR EVENT! EVERYONE GETS A BOUNTY!':{
        degree: minor,
        type: {
            name: 'bounty',
            role: 'roleforbounty',
        },
    },
};

let lastevent;
let lastevent_id;
/**
 * @type {Set<String>}
 */
let lastreporters = new Set();

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
            hook.send(
                `<@${event.degree.role}> <@${event.type.role}>`,
                new MessageEmbed()
                    .setTitle(clean)
                    .setColor(event.degree.color)
                    .setFooter(final._id)
                    .setTimestamp()
            );
        });
    }
});

router.use('/', (req,res)=>{
    res.status(200).json({});
});

module.exports = router;