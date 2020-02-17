const router = require('express').Router();
const {hypixelAPI} = require('./apiTools');
const Pit = require('./structures/Pit');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(json=>{
        const target = new Pit(json);
        res.status(200);
        if(!target.valid) res.json({success:false,error:target.error});
        else {
            target.loadInventorys().then(promises=>
                res.json({success:true,data:target})
            );
        }
    });
});

module.exports = router;