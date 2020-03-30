const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const playerDoc = require('../apiTools/playerDocRequest');
const { createCanvas, loadImage } = require('canvas');
const ImageHelpers = require('../utils/ImageHelpers');
const textHelpers = require('../utils/TextHelpers');

const error = (doc, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.status(400).json({ success: false, error: doc.error });
}

router.use('*',(req,res,next)=>{
    res.setHeader('Content-Type', 'image/png');
    next();
});

router.use('/level/:tag', async (req, res) => {
    let shadow = req.query.shadow !== 'false';
    let size = Number(req.query.size) || 40;
    if(size>1000) size = 1000;
    const doc = await playerDoc(req.params.tag);
    if(doc.error) return error(doc, res);
    const cvs = createCanvas(0,size);
    cvs.width = ImageHelpers.measure(doc.displayName,size,cvs);
    ImageHelpers.printText(cvs,doc.displayName,{size,shadow});
    cvs.createPNGStream().pipe(res);
});

router.use("/profile/:tag",async (req, res) => {
    const doc = await playerDoc(req.params.tag);
    if(doc.error) return error(doc, res);
    const img = await loadImage(`https://crafatar.com/avatars/${req.params.tag}?overlay=true`);
    const cvs = createCanvas(0,240);
    cvs.width = ImageHelpers.measure(doc.rankName,60,cvs)+250;
    const top = 15;
    ImageHelpers.printText(cvs,doc.rankName,{size:60,shadow:false,x:250,y:top});
    ImageHelpers.printText(cvs,`LVL: ${doc.formattedLevel}`,{size:50,shadow:false,x:250,y:top+60});
    ImageHelpers.printText(cvs,`Gold: §6${doc.gold.toLocaleString()}g`,{size:50,shadow:false,x:250,y:top+110});
    ImageHelpers.printText(cvs,`Played: §f${textHelpers.minutesToString(doc.playtime)}`,{size:50,shadow:false,x:250,y:top+160});
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img,0,0,240,240);
    cvs.createPNGStream().pipe(res);
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;