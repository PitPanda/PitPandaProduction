const router = require('express').Router();
const {WebhookClient, MessageEmbed} = require('discord.js');
const {EventWebHook} = require('../settings.json');
const hook = new WebhookClient(...EventWebHook);
const EventKey = require('../models/EventKey');
const EventLog = require('../models/EventLog');

const rgx = /^§r§(d|5)§lM(INO|AJO)R EVENT! §r§.§l[ A-Z0-9]{1,}/;

let lastevent = '';
let lastevent_id;
/**
 * @type {Set<String>}
 */
let lastreporters = new Set();

router.post('/', async (req,res)=>{
    res.status(200).json({success:true});
    if(!req.headers.key) return;
    const keyDoc = await EventKey.findById({_id:req.headers.key});
    if(!keyDoc) return;
    const final = req.headers.eventtype;
    console.log(final,rgx.test(final));
    if(rgx.test(final)){
        let end = final.indexOf('§7');
        if(end===-1)end=final.length;
        const clean = final.substring(0,end).replace(/§./g,'');
        if(clean===lastevent) return lastreporters.add(keyDoc.owner);
        if(lastevent_id) EventLog.findByIdAndUpdate(lastevent_id, {$set:{coreporters: [...lastreporters]}}).then(()=>{});
        lastreporters = new Set([keyDoc.owner]);
        lastevent = clean;
        const event = new EventLog({
            reporter: keyDoc.owner,
            event: clean
        });
        event.save((err,final)=>{
            if(err) return;
            lastevent_id = final._id;
            hook.send(
                new MessageEmbed()
                    .setTitle(clean)
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