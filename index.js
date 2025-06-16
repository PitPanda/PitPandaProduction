const connectionPromise = require('./setup');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const api = require('./routes');
const cors = require('cors');
const path = require('path');
require('./discordBot');

// for local dev
app.use(cors());

app.set('trust proxy', true);

app.use(express.static(path.join(__dirname, './PitPandaFrontend/build')));

app.use('/api', api);
app.use('/pitReference', (req, res) => res.status(200).sendFile(path.join(__dirname, "./PitPandaFrontend/src/pitMaster.json")));

app.ws('*', (ws,req)=>ws.send('Invalid websocket endpoint'))
app.use('*', (req, res) => res.status(200).sendFile(path.join(__dirname, "./PitPandaFrontend/build/index.html")));

// wait before starting mongo
connectionPromise.then(() => {
  app.listen(5000, () => console.log(`Pit Panda has just booted! Port ${5000}.`));
}).catch(err => {
  console.error('Failed to connect to MongoDB!!', err);
  process.exit(1);
});
