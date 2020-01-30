const router = require('express').Router();
const tools = require('./apiTools');

router.use('/:tag', (req,res)=>{
    tools.hypixelAPI(req.params.tag).then(json=>res.status(200).json(json));
});

router.use('*', tools.error('Invalid Player Endpoint'));

module.exports = router;