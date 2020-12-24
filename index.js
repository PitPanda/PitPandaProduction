const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const api = require('./routes');
const mongoose = require('mongoose');
const {dbLogin, Development} = require('./settings.json');
require('./discordBot');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

const redis = new (require('./utils/RedisClient'))(0);
const ApiKeys = require('./models/ApiKey');
ApiKeys.find({}).then(keys => {
  keys.forEach(key => {
    redis.client.hset(`apikey:${key._id}`, 'limit', key.limit, 'name', key.name);
  })
});

app.set('trust proxy', true);

app.use(express.static('PitPandaFrontend/build'));

app.use('/api', api);
app.use('/pitReference', (req, res) => res.status(200).sendFile(__dirname + "/PitPandaFrontend/src/pitMaster.json"));

app.ws('*', (ws,req)=>ws.send('Invalid websocket endpoint'))
app.use('*', (req, res) => res.status(200).sendFile(__dirname + "/PitPandaFrontend/build/index.html"));

app.listen(5000, () => console.log(`Pit Panda has just booted! Port ${5000}.`));
