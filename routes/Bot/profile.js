const router = require('express').Router();

const hypixelAPI = require('../../apiTools/playerRequest');
const Player = require('../../models/Player');

const removeColors = str => str.replace(/§./g, '');

router.get('/:tag', async (req, res) => {
    const target = await hypixelAPI(req.params.tag);

    if (target.error) return res.status(400).json({ success: false, error: target.error });

    const doc = await Player.findOne({ _id: target.uuid });

    data = {};

    if(doc && doc.flag) {
      const {addedby, timestamp, evidence, ...flag} = doc.toJSON().flag;
      data.flag = flag;
      data.display = doc.profileDisplay;
  }

    data.uuid = target.uuid;
    data.name = target.name;
    data.level = removeColors(target.levelFormattedName);
    data.bountiesClaimed = target.bountiesClaimed;
    data.gold = target.currentGold;
    data.xp = target.xp;
    data.goldReq = target.goldProgress;
    data.kdr = target.killDeathRatio;
    data.playtime = target.playtime;
    data.tradelimit = {
      count: target.tradeCount,
      gold: target.tradeGold,
    }
    data.renown = target.renown;
    data.online = target.online;
    data.lastSave = target.lastSave;

    res.status(200).json({ success: true, data });
});

module.exports = router;