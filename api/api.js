const router = require('express').Router();
const players = require('./players');
const dump = require('./dump');
const tradecenter = require('./tradecenter');
const tools = require('./apiTools');

router.use('*',(req,res,next)=>{
    const path = req.originalUrl;
    const last = path.lastIndexOf('/');
    console.log(`requested ${path.substring(last+1)} on ${path.substring(5,last)}`);
    next();
});

router.use('/players',players);
router.use('/dump',dump);
router.use('/tradecenter',tradecenter);

router.use('*', tools.APIerror('Invalid Endpoint'))

module.exports = router;