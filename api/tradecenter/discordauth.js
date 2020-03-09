const router = require('express').Router();
const hypixelAPI = require('../../apiTools/playerRequest');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(target=>{
        res.status(200);
        if(target.error) res.json({success:false,error:target.error});
        else res.json({
            success:true,
            discord: target.discord,
            prestige: target.prestige,
            username: target.name
        });
    });
});

module.exports = router;