const router = require('express').Router();
const tools = require('./apiTools');

router.use('/:tag', (req,res)=>{//res.status(200).json(json)
    tools.hypixelAPI(req.params.tag).then(json=>{
        res.status(200).json(json);
    });
});

router.use('*', tools.APIerror('Invalid Player Endpoint'));

module.exports = router;