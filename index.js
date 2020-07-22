const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const api = require('./routes');
const mongoose = require('mongoose');
const fs = require('fs');
const {dbLogin, Development} = require('./settings.json');
const RedisClient = new (require('./utils/RedisClient'))(0);
require('./discordBot');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

app.set('trust proxy', true);

app.use(express.static('frontEnd/build'));

const rateLimitManager = fs.readFileSync('./redis/scripts/rateLimitManager.lua', {encoding: 'utf-8'});

app.use('/api', async (req, res, next) => {
  let token = `rl:ip:${req.ip}`;
  let limit = 1;
  const [err, used] = await new Promise(resolve=>RedisClient.client.eval(rateLimitManager, 1, token, Math.floor(Date.now()/1e3), 60, limit, 1, (err, used)=>resolve([err,used])));
  if(err) {
    console.error(err);
    console.log(used);
    return res.status(500).send({ success: false, error: err });
  }
  if(used>=limit) return res.status(429).send({ success: false, error: 'Rate Limited' });
  next();
}, api);
app.use('/pitReference', (req, res) => res.status(200).sendFile(__dirname + "/frontEnd/src/pitMaster.json"));

app.ws('*', (ws,req)=>ws.send('Invalid websocket endpoint'))
app.use('*', (req, res) => res.status(200).sendFile(__dirname + "/frontEnd/build/index.html"));

app.listen(5000, () => console.log(`Pit Panda has just booted! Port ${5000}.`));