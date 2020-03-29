const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const playerDoc = require('../apiTools/playerDocRequest');
const { createCanvas } = require('canvas');
const ImageHelpers = require('../utils/ImageHelpers');

router.use('*',(req,res,next)=>{
    res.setHeader('Content-Type', 'image/png');
    next();
});

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
    cvs.width = ImageHelpers.measure(doc.displayName,size,cvs);
    ImageHelpers.printText(cvs,doc.displayName,{size,shadow});
    cvs.createPNGStream().pipe(res);
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;