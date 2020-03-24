const router = require('express').Router();
const {WebhookClient, MessageEmbed} = require('discord.js');
const {EventWebHook} = require('../settings.json');
const hook = new WebhookClient(...EventWebHook);
const EventKey = require('../models/EventKey');
const EventLog = require('../models/EventLog');

const rgx = /^§(d|5)§lM(INO|AJO)R EVENT! §.§l[ A-Z0-9]{1,}/;

let lastevent = '';

router.post('/', async (req,res)=>{
    if(!req.headers.Key) return res.status(200).json({success:false,error:'no key provided'});
    res.status(200).json({success:true});
    const keyDoc = await EventKey.findById({_id:req.headers.Key});
    if(!keyDoc) return res.status(200).json({success:false,error:'invalid key'});
    else res.status(200).json({success:true});
    let content = req.headers.eventtype;
    const input = parseValue(content).value;
    const final = stringifyComponent(input);
    if(rgx.test(final)){
        let end = final.indexOf('§7');
        if(end===-1)end=final.length;
        const clean = final.substring(0,end).replace(/§./g,'');
        if(clean===lastevent) return;
        lastevent = clean;
        const event = new EventLog({
            reporter: keyDoc.owner,
            event: clean
        });
        event.save((err,final)=>{
            if(err) return;
            hook.send(
                new MessageEmbed()
                    .setTitle(clean)
                    .setFooter(final._id)
                    .setTimestamp()
            );
        })
    }
});

router.use('/', (req,res)=>{
    res.status(200).json({});
});

function stringifyComponent(comp){
    if(!comp) return '';
    let output = '';
    if(comp.style){
        const style = comp.style;
        if(style.color) output+=style.color;
        if(style.bold) output+="§l";
        if(style.italic) output+="§o";
        if(style.underlined) output+="§n";
        if(style.obfuscated) output+="§lk";
    }
    output+=comp.text||'';
    if(comp.siblings) output+=comp.siblings.map(stringifyComponent).join('');
    return output;
}

function parseObject(text){
    let final = {};
    if(/^[_A-Z]{1,},\s/.test(text)){
        let comma = text.indexOf(',');
        return {value:text.substring(0,comma), rest:text.substring(comma+2)}
    }
    let start = text.indexOf('{')+1;
    if(!start) return {value:"ERROR",rest:""};
    let rest = text.substring(text.indexOf('{')+1);
    while(!rest.startsWith('}')){
        if(rest.startsWith(', ')) rest = rest.substring(2);
        const keyEnd = rest.indexOf('=');
        let key = rest.substring(0,keyEnd);
        rest=rest.substring(keyEnd+1);
        let partial = parseValue(rest);
        let value = partial.value;
        rest = partial.rest;
        final[key]=value;
    }
    return {value:final,rest:rest.substring(1)};
}

function parseArray(text){
    let rest = text.substring(1);
    let final = [];
    while(!rest.startsWith(']')){
        const partial = parseValue(rest);
        if(!partial) console.log(rest);
        rest = partial.rest;
        final.push(partial.value);
    }
    return {value:final,rest:rest.substring(1)};
}

function parseValue(text){
    if(!text) return {value:"error"};
    if(text.startsWith(', ')) text = text.substring(2);
    if(text.startsWith('\'')){
        const end = text.match(/[^\\]'/).index+1;
        return {value:text.substring(1,end), rest:text.substring(end+1)};
    }else if(text.startsWith('§')) return {value:text.substring(0,2),rest:text.substring(2)}
    else if(text.startsWith('null')) return {value:null,rest:text.substring(4)}
    else if(text.startsWith('true')) return {value:true,rest:text.substring(4)}
    else if(text.startsWith('false')) return {value:false,rest:text.substring(5)}
    else if(text.startsWith('[')) return parseArray(text);
    else return parseObject(text);
}

module.exports = router;