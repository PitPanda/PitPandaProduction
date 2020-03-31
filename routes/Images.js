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
    let size = Math.min(Number(req.query.size) || 40, 512);
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
    const img = await loadImage(`https://crafatar.com/avatars/${doc._id}?overlay=true`);
    const start = Date.now();
    let size = Math.min(Number(req.query.size) || 240, 512);
    const cvs = createCanvas(0,size);
    const x = size+size*(1/24);
    const nameSize = size/4;
    const line1 = `LVL: ${doc.formattedLevel}`;
    const line2 = `Gold: §6${doc.gold.toLocaleString()}g`;
    const line3 = `Played: §${req.query.playcolor||'f'}${textHelpers.minutesToString(doc.playtime)}`;
    cvs.width = Math.max(
        ImageHelpers.measure(doc.rankName,nameSize,cvs),
        ImageHelpers.measure(line1,nameSize,cvs),
        ImageHelpers.measure(line2,nameSize,cvs),
        ImageHelpers.measure(line3,nameSize,cvs),
    )+x;
    const ctx = cvs.getContext('2d');
    if(req.query.bg) {
        ctx.fillStyle=`#${req.query.bg}`;
        ctx.fillRect(0,0,cvs.width,cvs.height);
    }
    let shadow = req.query.shadow !== 'false';
    const top = 15;
    
    const subtitleSize = size*5/24;
    ImageHelpers.printText(cvs,doc.rankName,{size:size/4,shadow,x,y:top});
    ImageHelpers.printText(cvs,line1,{size:subtitleSize,shadow,x,y:top+nameSize});
    ImageHelpers.printText(cvs,line2,{size:subtitleSize,shadow,x,y:top+nameSize+subtitleSize});
    ImageHelpers.printText(cvs,line3,{size:subtitleSize,shadow,x,y:top+nameSize+subtitleSize*2});
    
    ctx.drawImage(img,0,0,size,size);
    cvs.createPNGStream().pipe(res);
    console.log(`took ${Date.now()-start}ms);
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;