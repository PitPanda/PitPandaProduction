const router = require('express').Router();
const {hypixelAPI} = require('../apiTools');
const Player = require('../structures/Player');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(json=>{
        const target = new Player(json);
        res.status(200)
        if(!target.valid) res.json(json);
        else res.json({
            success:true,
            discord: target.discord,
            prestige: target.prestige,
            username: target.name
        });
    });
});

module.exports = router;