const router = require('express').Router();
const players = require('./players');
const dump = require('./dump');
const item = require('./item');
const itemSearch = require('./itemSearch');
const tradecenter = require('./tradecenter');
const tools = require('./apiTools');
const username = require('./username');
const mongoose = require('mongoose');

mongoose.connect(require('../dbLogin.json'),{useNewUrlParser:true,useUnifiedTopology:true},()=>console.log('MongoDB Connected'));

router.use('*',(req,res,next)=>{
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