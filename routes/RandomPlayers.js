const router = require('express').Router();
const rateLimiter = require('../apiTools/rateLimiter');
const Player = require('../models/Player');
//const getDoc = require('../apiTools/playerDocRequest');

//const leaderboardFields = require('../models/Player/leaderboardFields');
//const allStats = Object.keys(leaderboardFields);

router.get('/', rateLimiter(1), async (req, res) => {
  const players = (await Player.aggregate([
    { $match: { playtime: { $gt: 36000 } } },
    { $sample: {size: 10} },
  ])).map(doc => ({
    uuid: doc._id,
    name: `${doc.formattedRank} ${doc.colouredName}`,
    level: doc.formattedLevel,
    gold: doc.gold,
    playtime: doc.playtime,
  }));
  res.json({ success: true, players });
});

module.exports = router;
