const { createCanvas, registerFont } = require('canvas');

registerFont('./frontEnd/src/Fonts/Minecraft-Regular.otf', {family: 'Minecraft'});
registerFont('./frontEnd/src/Fonts/minecraft-bold.otf', {family: 'Minecraft', weight:'bold'});
registerFont('./frontEnd/src/Fonts/minecraft-bold-italic.otf', {family: 'Minecraft', weight:'bold', style:'italic'});
registerFont('./frontEnd/src/Fonts/minecraft-italic.otf', {family: 'Minecraft', style:'italic'});

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

function or(a, b){
    return (typeof a === 'undefined') ? b : a;
}

const measure = (text,size,cvs) => {
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

/**
 * 
 * @param {*} cvs 
 * @param {string} msg 
 * @param {{x:number,y:number,size:number,shadow:boolean}} options 
 */
const printText = (cvs, msg, options={}) =>{
    const x = or(options.x,0);
    const y = or(options.y,0);
    const size = or(options.size,40);
    const shadow = or(options.shadow,true);
    if(!msg.startsWith('§'))msg='§7'+msg;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = "#ffffff";
    let parts = msg.split('§');
    let position = size*0.05;
    const offSet = Math.max(1,size*0.02);
    const adjustedy = y+size*(5/6);
    console.log({msg,x,y,adjustedy,size,shadow});
    let bold = false;
    let italic = false;
    let color = colors['7'];
    for(const part of parts){
        const key = part.charAt(0);
        color = colors[key] || color;
        if(key==='l') bold = true;
        else if(key==='n') italic = true;
        else if(key==='r') {
            bold = false;
            italic = false;
        }
        ctx.font = `${bold?'bold':''} ${italic?'italic':''} ${size}px "Minecraft"`;
        if(shadow){
            ctx.fillStyle = `#${color.textshadow}`;
            ctx.fillText(part.substring(1),Math.floor(x+position+offSet),y+Math.floor(adjustedy+offSet));
        }
        ctx.fillStyle = `#${color.color}`;
        ctx.fillText(part.substring(1),Math.floor(x+position),Math.floor(adjustedy));
        position += ctx.measureText(part.substring(1)).width;
    }
}

module.exports = { measure, printText, or, colors };