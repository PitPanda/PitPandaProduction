const router = require('express').Router();
const players = require('./players');
const dump = require('./dump');
const item = require('./item');
const itemSearch = require('./itemSearch');
const tradecenter = require('./tradecenter');
const tools = require('./apiTools');
const username = require('./username');
const mongoose = require('mongoose');
const ApiStat = require('./models/ApiStat');

let statBatch = {};
const batchSize = 10;

mongoose.connect(require('../dbLogin.json'),{useNewUrlParser:true,useUnifiedTopology:true},()=>console.log('MongoDB Connected'));

router.use('*',(req,res,next)=>{
    const args = req.originalUrl.substring(1).split('/');
    const path = `/api/${args[1]}`;
    if(!statBatch[path])statBatch[path]=1;
    else if(statBatch[path]===batchSize){
        statBatch[path]=0;
        ApiStat(path).findOneAndUpdate({date:Math.floor(Date.now()/86400e3)},{$inc:{count:batchSize}},{upsert:true,useFindAndModify:false}).catch(console.err);
    } statBatch[path]++;
    console.log(`requested ${req.originalUrl.substring(5)}`);
    next();
});

router.use('/players',players);
router.use('/dump',dump);
router.use('/tradecenter',tradecenter);
router.use('/item',item);
router.use('/itemSearch',itemSearch);
router.use('/username',username);

router.use('*', tools.APIerror('Invalid Endpoint'))

module.exports = router;
