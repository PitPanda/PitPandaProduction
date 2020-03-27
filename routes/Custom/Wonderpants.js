const router = require('express').Router();

const hypixelAPI = require('../../apiTools/playerRequest');

router.get('/:tag', async (req, res) => {
    const target = await hypixelAPI(req.params.tag);

    if (target.error) return res.status(400).json({ success: false, error: target.error });

    data = {};
    data.uuid = target.uuid;
    data.name = target.levelFormattedName;
    data.bounty = target.bounty;
    data.online = target.online;
    data.lastSave = target.lastSave;
    data.currentGold = target.currentGold;
    data.playtime = target.playtime;
    data.nbtInventories = {inventory:target.inventoryNBT,enderchest:target.enderchestNBT,armor:target.armorNBT};
    data.customInventories = target.buildCustominventories();
    data.xpProgress = target.xpProgress;
    data.goldProgress = target.goldProgress;
    data.renownProgress = target.renownProgress;
    res.status(200).json({ success: true, data });
});

module.exports = router;