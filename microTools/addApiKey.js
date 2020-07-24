const mongoose = require('mongoose');
const { dbLogin, Development } = require('../settings.json');

const uuid = require('uuid-with-v6');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

const ApiKeys = require('../models/ApiKey');
const redis = new (require('../utils/RedisClient'))(0);

const _id = uuid.v6();
const limit = Number(process.argv[2]);
const name = process.argv.slice(3).join(' ');
const keyDoc = new ApiKeys({ _id, limit, name });

keyDoc.save();

redis.client.hset(`apikey:${_id}`, 'limit', limit, 'name', name);

console.log(`key: ${_id}`);
console.log(`name: ${name}`);
console.log(`limit: ${limit}`);
