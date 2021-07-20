const router = require('express').Router();

const rateLimiter = require('../../apiTools/rateLimiter');
const hypixelAPI = require('../../apiTools/playerRequest');
const leaderboardFields = require('../../models/Player/leaderboardFields');
const allStats = Object.keys(leaderboardFields);
const RedisClient = require('../../utils/RedisClient');
const { cleanDoc } = require('../../apiTools/apiTools');
const redisClient = new RedisClient(0);

const removeColors = str => str.replace(/§./g, '');

router.get('/:tag', rateLimiter(12), async (req, res) => {
    const target = await hypixelAPI.player(req.params.tag);

    if (target.error) return res.status(400).json({ success: false, error: target.error });

    const data = {}

    let categories = req.query.categories;

    if (categories) categories = categories.split(",");
    else categories = allStats;

    const doc = await target.playerDoc;

    const results = await Promise.all(categories.map(async c => ({ rankName: c, rankValue: await redisClient.getRank(c, target.uuid) })));
    const rankings = {};
    for(const result of results) {
        if(result.rankValue!==null) rankings[result.rankName] = result.rankValue+1;
        else rankings[result.rankName] = null;
    }

    await target.loadInventorys();

    data.inventories = target.inventories;

    data.rankings = rankings;

    data.uuid = target.uuid;
    data.name = target.name;
    data.levelString = removeColors(target.formattedLevel);
    data.rank = target.rank;
    data.prefix = target.prefix;
    data.bounty = target.bounty;
    data.gold = target.currentGold;
    data.xp = target.xp;
    data.goldProgress = target.goldProgress;
    data.renownProgress = target.renownProgress;
    data.xpProgress = target.xpProgress;
    data.kdr = target.killDeathRatio;
    data.playtime = target.playtime;
    data.kills = target.kills;
    data.deaths = target.deaths;
    data.tradelimit = {
      count: target.tradeCount,
      gold: target.tradeGold,
    }
    data.renown = target.renown;
    data.lifetimeRenown = target.lifetimeRenown;
    data.online = target.online;
    data.lastSave = target.lastSave;
    data.doc = cleanDoc(doc);

    res.status(200).json({ success: true, data });
});

module.exports = router;
