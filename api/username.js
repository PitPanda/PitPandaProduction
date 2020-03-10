const router = require('express').Router();
const hypixelAPI = require('../apiTools/playerRequest');
const Player = require('../models/Player');
const getUsername = require('../apiTools/playerDocRequest');

router.use('/:uuid', (req,res)=>{
    getUsername(req.params.uuid).then(result=>{
        if(result.error) res.status(400).json({success:false,error:result.error});
        else res.status(200).json({success:true,name:result.displayName});
    })
});

module.exports = router;