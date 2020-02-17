const router = require('express').Router();
const players = require('./players');
const dump = require('./dump');
const item = require('./item');
const itemSearch = require('./itemSearch');
const tradecenter = require('./tradecenter');
const tools = require('./apiTools');
const mongoose = require('mongoose');

mongoose.connect(require('../dbLogin.json'),{useNewUrlParser:true,useUnifiedTopology:true},()=>console.log('MongoDB Connected'));

router.use('*',(req,res,next)=>{
    const path = req.originalUrl;
    const last = path.lastIndexOf('/');
    console.log(`requested ${path.substring(last+1)} on ${path.substring(5,last)}`);
    next();
});

router.use('/players',players);
router.use('/dump',dump);
router.use('/tradecenter',tradecenter);
router.use('/item',item);
router.use('/itemSearch',itemSearch);

router.use('*', tools.APIerror('Invalid Endpoint'))

module.exports = router;