const router = require('express').Router();
const fetch = require('node-fetch');
const uuid = require('uuid-with-v6');
const redis = new (require('../utils/RedisClient'))(0);
const crypto = require("crypto");
const getDoc = require('../apiTools/playerDocRequest');
const rateLimiter = require('../apiTools/rateLimiter');
const APPLICATION_PREFIX = "pitpanda_"

router.post("/", rateLimiter(10), async (req, res) => {
  const { username, salt } = req.query;
  if (!username || !salt) return res.status(400).json({ success: false, error: 'Include and a salt and a username as query parameters' });
  if (!salt.match(/^[0-9a-z]{30,40}$/)) return res.status(400).json({ success: false, error: 'Include a 40 length hex or 30 length base64 salt' });
  const ip = (req.headers["x-forwarded-for"] || req.ip || "")
    .replace(/^.*:/, "").split(",");
  
  try{
    const uuid = (await getUUID(username)).split('').filter(c => c !== '-').join('');

    const oncooldown = await new Promise(resolve => redis.client.get(`cd:${uuid}`, (err, reply) => {
      if(err) resolve(false);
      else resolve(reply === 'true');
    }));
    if(oncooldown) return res.status(429).json({ success: false, error: 'You are on a cooldown!' });

    const body = await fetch(`https://sessionserver.mojang.com/session/minecraft/hasJoined?username=${username}&serverId=${crypto.createHash("sha1").update(APPLICATION_PREFIX + uuid + salt).digest("hex")}&ip=${ip}`);
    const data = await body.json();
    if (data.id === uuid) {
      const { key, limit } = await genKey(uuid);
      return res.status(200).json({ success: true, key, limit });
    } else return res.status(403).json({ success: false, error: 'Submitted hash does not correspond to give user.' });
  }catch(e){
    console.error(e);
    res.status(400).json({ success: false, error: 'Something went wrong' });
  }
});

const genKey = async owner => {
  const key = uuid.v4();
  const doc = await getDoc(owner);
  let limit = 240;
  if(doc){
    switch(doc.role){
      case 'admin':
        limit = 10000;
        break;
      case 'contributor':
        limit = 1000;
        break;
      case 'supporter':
        limit = 480;
        break;
    }
  }
  const oldkey = await new Promise(resolve => redis.client.hget(`keyof:${owner}`, 'key', (err, key) => resolve(key)));
  if(oldkey) redis.client.del(`apikey:${oldkey}`);
  await new Promise(resolve => redis.client.hset(`apikey:${key}`, 'limit', limit, 'owner', owner, 'role', doc.role || 'none', (err, oldkey) => resolve(oldkey)));
  await new Promise(resolve => redis.client.hset(`keyof:${owner}`, 'key', key, resolve));
  redis.client.set(`cd:${owner}`, 'true', 'EX', 900);
  return { key, limit };
}

const getUUID = username => fetch("https://api.mojang.com/users/profiles/minecraft/" + username)
  .then(body => body.json())
  .then(json => json.id)

module.exports = router;
