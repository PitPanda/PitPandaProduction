const router = require('express').Router();
const players = require('./Players');
const chattriggers = require('./ChatTriggers');
const dump = require('./Dump');
const item = require('./Item');
const itemSearch = require('./ItemSearch');
const { APIerror } = require('../apiTools/apiTools');
const username = require('./Username');
const playerDoc = require('./PlayerDoc');
const custom = require('./Custom');
const images = require('./Images');
const leaderboard = require('./Leaderboard');
const indexer = require('./Indexer');
const ApiStat = require('../models/ApiStat');
const position =  require('./Position');
const randomPlayers =  require('./RandomPlayers');
const newMystics =  require('./NewMystics');
const bot =  require('./Bot');
const discordtodocs =  require('./DiscordToDocs');
const add =  require('./Add');
const friends =  require('./Friends');
const keyGen =  require('./KeyGen');
const keyInfo =  require('./KeyInfo');

let statBatch = {};
const batchSize = 10;
const showTwo = ['custom','images'];

router.use('*', (req, res, next) => {
    const args = req.originalUrl.substring(1).toLowerCase().split('/');
    if (!args[1]) return;
    let path = `/api/${args[1]}`;
    if (showTwo.includes(args[1])) path += `/${args[2]}`;
    if (!statBatch[path]) statBatch[path] = 1;
    else if (statBatch[path] === batchSize) {
        statBatch[path] = 1;
        ApiStat(path).findOneAndUpdate({ date: Math.floor(Date.now() / 86400e3) }, { $inc: { count: batchSize } }, { upsert: true }).catch(console.error);
    } statBatch[path]++;
    console.log(`requested ${req.originalUrl.substring(5)}`);
    res.setHeader('Content-Type', 'application/json');
    next();
});

router.use('/players', players);
router.use('/chattriggers', chattriggers);
router.use('/dump', dump);
router.use('/item', item);
router.use('/itemSearch', itemSearch);
router.use('/username', username);
router.use('/playerDoc', playerDoc);
router.use('/custom', custom);
router.use('/images', images);
router.use('/leaderboard', leaderboard);
router.use('/indexer', indexer);
router.use('/position', position);
router.use('/bot', bot);
router.use('/randomplayers', randomPlayers);
router.use('/newmystics', newMystics);
router.use('/discordtodocs', discordtodocs);
router.use('/add', add);
router.use('/friends', friends);
router.use('/keygen', keyGen);
router.use('/keyinfo', keyInfo);

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;
