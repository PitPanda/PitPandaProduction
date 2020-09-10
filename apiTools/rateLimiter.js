const fs = require('fs');
const RedisClient = new (require('../utils/RedisClient'))(0);

const rateLimitManager = fs.readFileSync('./redis/scripts/rateLimitManager.lua', {encoding: 'utf-8'});

module.exports = cost => async (req, res, next) => {
  let token = `rl:ip:${req.ip}`;
  let limit = 120;
  const passed = req.query.key || req.get("X-API-Key");
  if(passed){
    try{
      limit = await new Promise((resolve, reject) => RedisClient.client.hget(`apikey:${passed}`, 'limit', (err, limit) => {
        if(err) reject(err);
        resolve(Number(limit));
      }));
      token = `rl:key:${passed}`;
    }catch(e){ }
  }
  const [err, used] = await new Promise(resolve=>RedisClient.client.eval(rateLimitManager, 1, token, Math.floor(Date.now()/1e3), 60, limit, cost, (err, used)=>resolve([err,used])));
  if(err) {
    console.error(err);
    return res.status(500).send({ success: false, error: err });
  }
  if(used>limit) return res.status(429).send({ success: false, error: 'Rate Limited' });
  next();
}
