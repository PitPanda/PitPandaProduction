const router = require('express').Router();
const players = require('./Players');
const dump = require('./Dump');
const item = require('./Item');
const itemSearch = require('./ItemSearch');
const { APIerror } = require('../apiTools/apiTools');
const username = require('./Username');
const playerDoc = require('./PlayerDoc');
const custom = require('./Custom');
const leaderboard = require('./Leaderboard');
const events = require('./Events');
const mongoose = require('mongoose');
const ApiStat = require('../models/ApiStat');

let statBatch = {};
const batchSize = 10;

mongoose.connect(require('../dbLogin.json'), { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);

router.use('*', (req, res, next) => {
    const args = req.originalUrl.substring(1).toLowerCase().split('/');
    if (!args[1]) return;
    let path = `/api/${args[1]}`;
    if (args[1] === 'custom') path += `/${args[2]}`
    if (!statBatch[path]) statBatch[path] = 1;
    else if (statBatch[path] === batchSize) {
        statBatch[path] = 1;
        ApiStat(path).findOneAndUpdate({ date: Math.floor(Date.now() / 86400e3) }, { $inc: { count: batchSize } }, { upsert: true }).catch(console.error);
    } statBatch[path]++;
    console.log(`requested ${req.originalUrl.substring(5)}`);
    next();
});

router.use('/players', players);
router.use('/dump', dump);
router.use('/item', item);
router.use('/itemSearch', itemSearch);
router.use('/username', username);
router.use('/playerDoc', playerDoc);
router.use('/custom', custom);
router.use('/leaderboard', leaderboard);
router.use('/events', events);

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;
