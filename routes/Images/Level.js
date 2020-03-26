const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const { createCanvas, registerFont } = require('canvas');
const playerDoc = require('../../apiTools/playerDocRequest');

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

const width = 600, height = 40;

router.use('/:tag', async (req, res) => {
    const cvs = createCanvas(width,height);
    const ctx = cvs.getContext('2d');
    ctx.font = '40px "Minecraft"';
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,width,height);
    const doc = await playerDoc(req.params.tag);
    if (doc.error) {
        res.setHeader('Content-Type', 'application/json')
        res.status(400).json({ success: false, error: doc.error });
        return;
    }
    let parts = doc.displayName.split('§');
    let position = 5;

    for(const part of parts){
        const color = colors[part.charAt(0)];
        if(color) ctx.fillStyle = `#${color.textshadow}`;
        ctx.fillText(part.substring(1),position+1,34);
        if(color) ctx.fillStyle = `#${color.color}`;
        ctx.fillText(part.substring(1),position,33);
        position += ctx.measureText(part.substring(1)).width;
    }

    cvs.createPNGStream().pipe(res);
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;