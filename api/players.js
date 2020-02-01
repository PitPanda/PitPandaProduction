const router = require('express').Router();
const {hypixelAPI} = require('./apiTools');
const Pit = require('./structures/Pit');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(json=>{
        const target = new Pit(json);
        res.status(200)
        if(!target.valid) res.json(json);
        else {
            let result = {};
            let waiting = [
                target.inventory.then(inv=>result.inv=inv)
            ];
            result.username = target.name;

            
            Promise.all(waiting).then(()=>res.json({success:true,data:result}));
        }
    });
});

module.exports = router;