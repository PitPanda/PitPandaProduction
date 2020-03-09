const router = require('express').Router();
const hypixelAPI = require('../apiTools/playerRequest');
const Player = require('../models/Player');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(target=>{
        if(target.error) res.status(400).json({success:false,error:target.error});
        else {
            Promise.all([target.loadInventorys(),Player.findOne({_id:target.uuid})]).then(([,player])=>{
                data = {};
                if(player) data.profileDisplay = player.profileDisplay;
                data.uuid = target.uuid;
                data.name = target.name;
                data.bounty = target.bounty;
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
                data.recentKills = target.recentKillsSimple;
                res.status(200).json({success:true,data});
            });
        }
    });
});

module.exports = router;