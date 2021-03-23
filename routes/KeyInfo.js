const router = require('express').Router();
const redis = new (require('../utils/RedisClient'))(0);
const rateLimiter = require('../apiTools/rateLimiter');

router.get("/", rateLimiter(1, true), async (req, res) => {
  const checking = req.query.checkkey || req.apiKey;
  redis.client.hgetall(`apikey:${checking}`, (err, reply) => {
    if(err || Object.keys(reply).length === 0) res.status(400).send({ success: false });
    redis.client.hgetall(`keyof:${reply.owner}`, (err2, reply2) => {
      res.send({success: true, limit: Number(reply.limit), owner: reply.owner, uses: Number(reply2.uses) });
    });
  });
});

module.exports = router;
