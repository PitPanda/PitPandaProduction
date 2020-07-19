const router = require('express').Router();
const { APIerror, dbToItem } = require('../apiTools/apiTools');
const playerDoc = require('../apiTools/playerDocRequest');
const { createCanvas, loadImage } = require('canvas');
const ImageHelpers = require('../utils/ImageHelpers');
const textHelpers = require('../utils/TextHelpers');
const Leaderboards = require('../apiTools/lbProxy');
const Mystics = require('../models/Mystic');

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
    let size = Math.max(Math.min(Number(req.query.size) || 40, 512),10);
    if(size>1000) size = 1000;
    const doc = await playerDoc(req.params.tag);
    if(doc.error) return error(doc, res);
    const cvs = createCanvas(0,size);
    cvs.width = ImageHelpers.measure(doc.displayName,size,cvs);
    if(req.query.bg) {
        const ctx = cvs.getContext('2d');
        ctx.fillStyle=`#${req.query.bg}`;
        ctx.fillRect(0,0,cvs.width,cvs.height);
    }
    ImageHelpers.printText(cvs,doc.displayName,{size,shadow});
    cvs.createPNGStream().pipe(res);
});

router.use("/leaderboards/:cat/:tag",async (req, res) => {
    const doc = await playerDoc(req.params.tag);
    if(doc.error) return error(doc, res);
    let size = Math.max(Math.min(Number(req.query.size) || 128, 512),40);
    const cvs = createCanvas(0,size);
    const x = size+size*(1/24);
    const nameSize = size/4;
    const line1 = `LVL: ${doc.formattedLevel}`;
    const line2 = `Gold: §6${doc.gold.toLocaleString()}g`;
    const category = Leaderboards[req.params.cat];
    const line3 = `${category.short}: §d${category.transform(doc[req.params.cat])}`;
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
    const top = size*3/48;
    
    const subtitleSize = size*5/24;
    ImageHelpers.printText(cvs,doc.rankName,{size:size/4,shadow,x,y:top});
    ImageHelpers.printText(cvs,line1,{size:subtitleSize,shadow,x,y:top+nameSize});
    ImageHelpers.printText(cvs,line2,{size:subtitleSize,shadow,x,y:top+nameSize+subtitleSize});
    ImageHelpers.printText(cvs,line3,{size:subtitleSize,shadow,x,y:top+nameSize+subtitleSize*2});
    try{
        const img = await loadImage(`https://crafatar.com/avatars/${doc._id}?overlay=true`);
        ctx.drawImage(img,0,0,size,size);
    }catch(e){
        ImageHelpers.printText(cvs,'§cFailed to',{size:subtitleSize,shadow,x:0,y:top});
        ImageHelpers.printText(cvs,'§cload',{size:subtitleSize,shadow,x:0,y:top+subtitleSize});
    }
    cvs.createPNGStream().pipe(res);
});

router.use("/profile/:tag",async (req, res) => {
    const doc = await playerDoc(req.params.tag);
    if(doc.error) return error(doc, res);
    let size = Math.max(Math.min(Number(req.query.size) || 128, 512),40);
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
    const top = size*3/48;
    
    const subtitleSize = size*5/24;
    ImageHelpers.printText(cvs,doc.rankName,{size:size/4,shadow,x,y:top});
    ImageHelpers.printText(cvs,line1,{size:subtitleSize,shadow,x,y:top+nameSize});
    ImageHelpers.printText(cvs,line2,{size:subtitleSize,shadow,x,y:top+nameSize+subtitleSize});
    ImageHelpers.printText(cvs,line3,{size:subtitleSize,shadow,x,y:top+nameSize+subtitleSize*2});
    try{
        const img = await loadImage(`https://crafatar.com/avatars/${doc._id}?overlay=true`);
        ctx.drawImage(img,0,0,size,size);
    }catch(e){
        ImageHelpers.printText(cvs,'§cFailed to',{size:subtitleSize,shadow,x:0,y:top});
        ImageHelpers.printText(cvs,'§cload',{size:subtitleSize,shadow,x:0,y:top+subtitleSize});
    }
    cvs.createPNGStream().pipe(res);
});

router.use("/item/:id",async (req, res) => {
    const doc = await Mystics.findById(req.params.id);
    console.log(doc);
    if(!doc) return error({error:'item not found'}, res);
    const data = dbToItem(doc);
    console.log(data);
    const textSize = 24;
    const cvs = createCanvas(0,1+data.item.desc*textSize);
    const lines = [data.item.name, ...data.item.desc];
    cvs.width = Math.max(...lines.map(line=>ImageHelpers.measure(line,textSize,cvs)));
    console.log(cvs.width);
    const ctx = cvs.getContext('2d');
    if(req.query.bg) {
        ctx.fillStyle=`#$120211`;
        ctx.fillRect(0,0,cvs.width,cvs.height);
    }
    lines.forEach((line,index) => ImageHelpers.printText(cvs,line,{size:textSize,shadow:true,x:0,y:textSize*index}));
    console.log('finished');
    cvs.createPNGStream().pipe(res);
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;