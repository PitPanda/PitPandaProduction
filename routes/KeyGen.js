const router = require('express').Router();
const fetch = require('node-fetch');
const uuidv6 = require('uuid-with-v6');
const redis = new (require('../utils/RedisClient'))(0);
const getDoc = require('../apiTools/playerDocRequest');
const rateLimiter = require('../apiTools/rateLimiter');

router.post("/", rateLimiter(10), async (req, res) => {
  const { username, hash } = req.query;
  if (!username || !hash) return res.status(400).json({ success: false });
  const ip = (req.headers["x-forwarded-for"] || req.ip || "")
    .replace(/^.*:/, "").split(",");

  try{
    const uuid = (await getUUID(username)).split('').filter(c => c !== '-').join('');
    const body = await fetch(`https://sessionserver.mojang.com/session/minecraft/hasJoined?username=${username}&serverId=${hash}&ip=${ip}`);
    const data = await body.json();
    if (data.id === uuid) {
      const { key, limit } = await genKey(uuid);
      return res.status(200).json({ success: true, key, limit });
    } else return res.status(403).json({ success: false });
  }catch(e){
    res.status(400).json({ success: false });
  }
});

const genKey = async owner => {
  const key = uuidv6.v6();
  const doc = await getDoc(owner);
  let limit = 240;
  if(doc){
    if(doc.admin){
      limit = 10000;
    }else if(doc.profileDisplay){
      limit = 480;
    }
  }
  const oldkey = await new Promise(resolve => redis.client.hget(`keyof:${owner}`, 'key', resolve));
  if(oldkey) redis.client.del(`apikey:${oldkey}`);
  await new Promise(resolve => redis.client.hset(`apikey:${key}`, 'limit', limit, 'owner', owner, (err, oldkey) => resolve(oldkey)));
  await new Promise(resolve => redis.client.hset(`keyof:${owner}`, 'key', key, resolve));
  return { key, limit };
}

const getUUID = username => fetch("https://api.mojang.com/users/profiles/minecraft/" + username)
  .then(body => body.json())
  .then(json => json.id)

module.exports = router;
