const router = require('express').Router();
const redis = new (require('../utils/RedisClient'))(0);
const rateLimiter = require('../apiTools/rateLimiter');

router.get("/", rateLimiter(1, true), async (req, res) => {
  redis.client.hgetall(`apikey:${req.apiKey}`, (err, reply) => {
    if(err || Object.keys(reply).length === 0) res.status(400).send({ success: false });
    res.send({success: true, limit: Number(reply.limit), owner: reply.owner })
  });
});

module.exports = router;
