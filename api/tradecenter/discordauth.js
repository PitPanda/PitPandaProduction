const router = require('express').Router();
const {hypixelAPI} = require('../apiTools');
const Pit = require('../structures/Pit');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(json=>{
        const target = new Pit(json);
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