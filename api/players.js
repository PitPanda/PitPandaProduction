const router = require('express').Router();
const hypixelAPI = require('../playerRequest');
const Player = require('../models/Player');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(target=>{
        res.status(200);
        if(target.error) res.json({success:false,error:target.error});
        else {
            target.loadInventorys().then(()=>{
                data = {};
                data.uuid = target.uuid;
                data.name = target.name;
                data.online = target.online;
                data.lastSave = target.lastSave;
                data.formattedName = target.formattedName;
                data.formattedLevel = target.formattedLevel;
                data.currentGold = target.currentGold;
                data.playtime = target.playtime;
                data.inventories = target.inventories;
                data.prestiges = target.prestiges;
                data.xpProgress = target.xpProgress;
                data.goldProgress = target.goldProgress;
                data.renownProgress = target.renownProgress;
                res.json({success:true,data})
            });
        }
    });
});

module.exports = router;