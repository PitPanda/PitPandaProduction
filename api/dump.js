const router = require('express').Router();
const hypixelAPI = require('../playerRequest');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(target=>{
        res.status(200);
        if(target.error) res.json({success:false,error:target.error});
        else {
            target.loadInventorys().then(promises=>
                res.json({success:true,data:target})
            );
        }
    });
});

module.exports = router;