const router = require('express').Router();
const {WebhookClient, MessageEmbed} = require('discord.js');
const {EventWebHook} = require('../settings.json');
const hook = new WebhookClient(...EventWebHook);
const EventKey = require('../models/EventKey');
const EventLog = require('../models/EventLog');

const rgx = /^(§r)?§(d|5)§lM(INO|AJO)R EVENT! (§r)?§.§l[ A-Z0-9]{1,}/;

const events = {
    'MAJOR EVENT! SPIRE':{
        degree: 'major',
        type: 'spire',
    },
    'MAJOR EVENT! BLOCKHEAD':{
        degree: 'major',
        type: 'blockhead',
    },
    'MAJOR EVENT! BEAST':{
        degree: 'major',
        type: 'beast',
    },
    'MAJOR EVENT! RAGE PIT':{
        degree: 'major',
        type: 'rage pit',
    },
    'MAJOR EVENT! SQUADS':{
        degree: 'major',
        type: 'squads',
    },
    'MAJOR EVENT! RAFFLE':{
        degree: 'major',
        type: 'raffle',
    },
    'MAJOR EVENT! ROBBERY':{
        degree: 'major',
        type: 'robbery',
    },
    'MINOR EVENT! KOTH':{
        degree: 'minor',
        type: 'koth',
    },
    'MINOR EVENT! DRAGON EGG':{
        degree: 'minor',
        type: 'dragon',
    },
    'MINOR EVENT! CARE PACKAGE':{
        degree: 'minor',
        type: 'package',
    },
    'MINOR EVENT! KOTL':{
        degree: 'minor',
        type: 'kotl',
    },
    'MINOR EVENT! 2X REWARDS':{
        degree: 'minor',
        type: 'double',
    },
    'MINOR EVENT! AUCTION!':{
        degree: 'minor',
        type: 'auction',
    },
    'MINOR EVENT! GIANT CAKE':{
        degree: 'minor',
        type: 'cake',
    },
    'MINOR EVENT! EVERYONE GETS A BOUNTY!':{
        degree: 'minor',
        type: 'bounty',
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
            degree: event.degree,
            type: event.type,
        });
        eventLog.save((err,final)=>{
            if(err) return;
            lastevent_id = final._id;
            hook.send(
                new MessageEmbed()
                    .setTitle(JSON.stringify(event))
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