require('../setup');

const redis = new (require('../utils/RedisClient'))(0);

const scanHandler = (err, [cursor, keys]) => {
  for(const key of keys){
    redis.client.del(key);
  }
  if(cursor != 0) redis.client.scan(cursor, 'MATCH', 'rl:*', scanHandler)
  else{
    console.log('done!')
    process.exit(0);
  }
}

redis.client.scan(0, 'MATCH', 'rl:*', scanHandler)

