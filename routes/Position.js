const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const rateLimiter = require('../apiTools/rateLimiter');
const RedisClient = require('../utils/RedisClient');
const redisClient = new RedisClient(0);

const leaderboardFields = require('../models/Player/leaderboardFields');
const allStats = Object.keys(leaderboardFields);

router.get('/:uuid', rateLimiter(1), async (req, res) => {
    let categories = req.query.categories;

    if (categories) categories = categories.split(",");
    else categories = allStats;

    const results = await Promise.all(categories.map(async c => ({ rankName: c, rankValue: await redisClient.getRank(c, req.params.uuid) })));
    let rankings = {};
    for(const result of results) {
        if(result.rankValue!==null) rankings[result.rankName] = result.rankValue+1;
        else rankings[result.rankName] = null;
    }
    res.json({ success: true, rankings });
});
router.get('*', APIerror('Invalid Endpoint'));

module.exports = router;
