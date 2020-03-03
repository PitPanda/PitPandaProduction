const router = require('express').Router();
const hypixelAPI = require('../playerRequest');
const Player = require('../models/Player');

router.use('/:uuid', (req,res)=>{
    Player.findOne({_id:req.params.uuid}).then(player=>{
        if(!player || Date.now()-player.lastsave > 43200e3) { //if player is not on record or been over 12 hours since last check
            hypixelAPI(req.params.uuid).then(target=>{
                if(target.error) res.status(404).send({success:false,error:target.error});
                else res.status(200).send({success:true,name:target.levelFormattedName});
            })
        }else{
            res.status(200).send({success:true,name:player.displayName});
        }
    });
});

module.exports = router;