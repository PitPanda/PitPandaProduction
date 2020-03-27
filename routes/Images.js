const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const { createCanvas, registerFont } = require('canvas');
const playerDoc = require('../apiTools/playerDocRequest');

router.use('*',(req,res,next)=>{
    res.setHeader('Content-Type', 'image/png');
    next();
});

const colors = {
    '0': {color:'000000',textshadow:'000000'},
    '1': {color:'0000AA',textshadow:'00006A'},
    '2': {color:'00AA00',textshadow:'006A00'},
    '3': {color:'00AAAA',textshadow:'006A6A'},
    '4': {color:'AA0000',textshadow:'6A0000'},
    '5': {color:'AA00AA',textshadow:'6A006A'},
    '6': {color:'FFAA00',textshadow:'BF6A00'},
    '7': {color:'999999',textshadow:'595959'},
    '8': {color:'3f3f3f',textshadow:'000000'},
    '9': {color:'5555FF',textshadow:'1515BF'},
    'a': {color:'55FF55',textshadow:'15BF15'},
    'b': {color:'55FFFF',textshadow:'15BFBF'},
    'c': {color:'FF5555',textshadow:'BF1515'},
    'd': {color:'FF55FF',textshadow:'BF15BF'},
    'e': {color:'FFFF55',textshadow:'BFBF15'},
    'f': {color:'FFFFFF',textshadow:'BFBFBF'}
};   

registerFont('./frontEnd/src/Fonts/Minecraft-Regular.otf', {family: 'Minecraft'});
registerFont('./frontEnd/src/Fonts/minecraft-bold.otf', {family: 'Minecraft', weight:'bold'});
registerFont('./frontEnd/src/Fonts/minecraft-bold-italic.otf', {family: 'Minecraft', weight:'bold', style:'italic'});
registerFont('./frontEnd/src/Fonts/minecraft-italic.otf', {family: 'Minecraft', style:'italic'});

router.use('/level/:tag', async (req, res) => {
    let shadow = req.query.shadow !== 'false';
    let size = Number(req.query.size) || 40;
    if(size>1000) size = 1000;
    const doc = await playerDoc(req.params.tag);
    if (doc.error) {
        res.setHeader('Content-Type', 'application/json')
        res.status(400).json({ success: false, error: doc.error });
        return;
    }
    const cvs = createCanvas(0,size);
    cvs.width = measure(doc.displayName,size,cvs);
    printText(cvs,doc.displayName,{size,shadow});
    cvs.createPNGStream().pipe(res);
});

function measure(text,size,cvs){
    if(!cvs) cvs = createCanvas(0,0);
    const ctx = cvs.getContext('2d');
    let bold = false;
    let len = size*0.05;
    for(const part of text.split('§')){
        if(part.charAt(0)==='l') bold = true;
        else if (part.charAt(0)==='r') bold = false;
        ctx.font = `${bold?'bold':''} ${size}px "Minecraft"`;
        len += ctx.measureText(part.substring(1)).width;
    }
    return len;
}

function printText(cvs, msg, options={}){
    const x = or(options.x,0);
    const y = or(options.y,0);
    const size = or(options.size,40);
    const shadow = or(options.shadow,true);
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = "#ffffff";
    let parts = msg.split('§');
    let position = size*0.05;
    const offSet = Math.max(1,size*0.02);
    const adjustedy = y+size*(5/6);
    let bold = false;
    let italic = false;
    for(const part of parts){
        const key = part.charAt(0);
        const color = colors[key];
        if(key==='l') bold = true;
        else if(key==='n') italic = true;
        else if(key==='r') (bold = false) && (italic = false);
        ctx.font = `${bold?'bold':''} ${italic?'italic':''} ${size}px "Minecraft"`;
        if(shadow){
            if(color) ctx.fillStyle = `#${color.textshadow}`;
            ctx.fillText(part.substring(1),Math.floor(x+position+offSet),y+Math.floor(y+adjustedy+offSet));
        }
        if(color) ctx.fillStyle = `#${color.color}`;
        ctx.fillText(part.substring(1),Math.floor(x+position),Math.floor(y+adjustedy));
        position += ctx.measureText(part.substring(1)).width;
    }
}

function or(a, b){
    return (typeof a === 'undefined') ? b : a;
}

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;