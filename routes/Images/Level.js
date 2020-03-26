const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const { createCanvas, registerFont } = require('canvas');
const playerDoc = require('../../apiTools/playerDocRequest');

const colors = {
    '0': '#000000',
    '1': '#0000AA',
    '2': '#00AA00',
    '3': '#00AAAA',
    '4': '#AA0000',
    '5': '#AA00AA',
    '6': '#FFAA00',
    '7': '#999999',
    '8': '#3f3f3f',
    '9': '#5555FF',
    'a': '#55FF55',
    'b': '#55FFFF',
    'c': '#FF5555',
    'd': '#FF55FF',
    'e': '#FFFF55',
    'f': '#FFFFFF'
};   

registerFont('./frontEnd/src/Fonts/Minecraft-Regular.otf', {family: 'Minecraft'});

router.use('/:tag', async (req, res) => {
    const cvs = createCanvas(600,40);
    const ctx = cvs.getContext('2d');
    ctx.font = 'bold 40px "Minecraft"';
    ctx.fillStyle = "#ffffff";
    const doc = await playerDoc(req.params.tag);
    let parts = doc.displayName.split('§');
    let position = 5;

    for(const part of parts){
        const color = colors[part.charAt(0)];
        if(color) ctx.fillStyle = color;
        ctx.fillText(part.substring(1),position,33);

        position += ctx.measureText(part.substring(1)).width;
    }

    cvs.createPNGStream().pipe(res);
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;