const mongoose = require('mongoose');
const { dbLogin, Development } = require('../settings.json');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

const express = require('express');
const app = express();

const requestPlayer = require('../apiTools/playerRequest');
const playerDoc = require('../models/Player');

//constants
const batchSize = 500;
const checkTimeout = 2e3;

let remaingCount = 0;
let dailyCount = 0;

const dailyFilter = {
    lastinpit: {
        $gte: new Date(Date.now() - 14 * 86400e3),
    }
}

const recentFiler = {
    lastsave: {
        $lte: new Date(Date.now() - 86400e3),
    },
}

const queryFilter = {...dailyFilter,...recentFiler};

const wait = ms => new Promise(res=>setTimeout(res,ms));

const runBatch = async () => {
    const batch = await playerDoc.find(queryFilter, { _id: 1 }).lean().limit(batchSize);
    const timeout = wait(checkTimeout*batchSize);
    for(const { _id } of batch){
        requestPlayer.player(_id);
        await wait(checkTimeout);
    }

    await timeout;

    runBatch();
}

const update = async () => {
    remaingCount = await playerDoc.find(queryFilter).countDocuments();
    dailyCount = await playerDoc.find(dailyFilter).countDocuments();
}
update();
setInterval(update, 300e3);

if (!Development) runBatch(); //entry point

app.get('/', (req, res) => {
    res.json({dailyCount, remaingCount, checkTimeout})
})

app.listen(5001, () => console.log('Indexer booted! Port 5001.'));