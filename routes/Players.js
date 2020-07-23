const router = require('express').Router();

const hypixelAPI = require('../apiTools/playerRequest');
const Player = require('../models/Player');
const rateLimiter = require('../apiTools/rateLimiter');
router.get('/:tag', rateLimiter(10), async (req, res) => {
    const target = await hypixelAPI(req.params.tag);

    if (target.error) return res.status(400).json({ success: false, error: target.error });

    Promise.all([target.loadInventorys(), Player.findOne({ _id: target.uuid })]).then(([, player]) => {
        data = {};
        if (player) {
            data.profileDisplay = player.profileDisplay;
            if(player.flag){
                const {addedby, timestamp, evidence, ...flag} = player.toJSON().flag;
                data.flag = flag;
            }
        }
        data.uuid = target.uuid;
        data.name = target.name;
        data.bounty = target.bounty;
        data.online = target.online;
        data.lastSave = target.lastSave;
        data.lastLogout = target.lastLogout;
        data.formattedName = target.formattedName;
        data.formattedLevel = target.formattedLevel;
        data.currentGold = target.currentGold;
        data.playtime = target.playtime;
        data.inventories = target.inventories;
        data.prestiges = target.prestiges;
        data.xpProgress = target.xpProgress;
        data.goldProgress = target.goldProgress;
        data.renownProgress = target.renownProgress;
        res.status(200).json({ success: true, data });
    });
});

module.exports = router;