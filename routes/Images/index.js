const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const level = require('./Level');

router.use('*',(req,res,next)=>{
    res.setHeader('Content-Type', 'image/png');
    next();
});

router.use('/level', level);
router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;