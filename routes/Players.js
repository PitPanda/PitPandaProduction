const router = require('express').Router();

const hypixelAPI = require('../apiTools/playerRequest');
const rateLimiter = require('../apiTools/rateLimiter');
const { cleanDoc, getDisplays } = require('../apiTools/apiTools');

router.get('/:tag', rateLimiter(10), async (req, res) => {
    const target = await hypixelAPI.player(req.params.tag);

    if (target.error) return res.status(400).json({ success: false, error: target.error });

    const [, displayResults ] = await Promise.all([
        target.loadInventorys(), 
        getDisplays(target.uuid)
    ]);

    const data = {};

    data.displays = displayResults.displays;

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
    data.doc = cleanDoc(displayResults.self || await target.playerDoc);
    res.status(200).json({ success: true, data });
});

module.exports = router;
