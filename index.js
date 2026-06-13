const connectionPromise = require('./setup');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const api = require('./routes');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const getPlayerData = require('./apiTools/getPlayerData');
require('./discordBot');

// for local dev
app.use(cors());

app.set('trust proxy', true);

const buildDir = path.join(__dirname, './PitPandaFrontend/build');
const htmlPath = path.join(buildDir, 'index.html');
let htmlTemplate;
try {
  htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
} catch (e) {
  console.warn('index.html template not found — SSR disabled until frontend is built');
}

app.use(express.static(buildDir));

app.get('/players/:tag', async (req, res) => {
  if (!htmlTemplate) return res.status(200).sendFile(htmlPath);

  try {
    const result = await getPlayerData(req.params.tag);

    const serialized = JSON.stringify(result)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

    let html = htmlTemplate;
    html = html.replace('</head>', `<script>window.__PLAYER_DATA__=${serialized}</script></head>`);

    if (result.success && result.data.name) {
      const safeName = result.data.name.replace(/[<>&"]/g, '');
      html = html.replace(/<title>.*?<\/title>/, `<title>${safeName} - Pit Panda</title>`);
      const ogTags =
        `<meta property="og:title" content="${safeName} - Pit Panda"/>` +
        `<meta property="og:description" content="View ${safeName}'s Hypixel Pit stats on Pit Panda"/>`;
      html = html.replace('</head>', `${ogTags}</head>`);
    }

    res.send(html);
  } catch (e) {
    console.error('SSR error:', e);
    const errData = JSON.stringify({ success: false, error: 'Server error' })
      .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    res.send(htmlTemplate.replace('</head>', `<script>window.__PLAYER_DATA__=${errData}</script></head>`));
  }
});

app.use('/api', api);
app.use('/pitReference', (req, res) => res.status(200).sendFile(path.join(__dirname, "./PitPandaFrontend/src/pitMaster.json")));

app.ws('*', (ws,req)=>ws.send('Invalid websocket endpoint'))
app.use('*', (req, res) => res.status(200).sendFile(htmlPath));

// wait before starting mongo
connectionPromise.then(() => {
  app.listen(5000, () => console.log(`Pit Panda has just booted! Port ${5000}.`));
}).catch(err => {
  console.error('Failed to connect to MongoDB!!', err);
  process.exit(1);
});
