const mongoose = require('mongoose');
const { dbLogin, Development } = require('../settings.json');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

const RedisClient = require('../utils/RedisClient');
const redisClient = new RedisClient(0);

const express = require('express');
const app = express();

const requestPlayer = require('../apiTools/playerRequest');
const playerDoc = require('../models/Player');

//constants
const maxQueueSize = 1000;
const maxBatchSize = 1;
const batchTimeout = 1000;

let currentQueue = 0;
let lastQueueChange = 0;
let estimatedCount = 0;
let lastQueueSize = 0;

const queue = [];

const queryFilter = {
    lastinpit: {
        $gte: new Date(Date.now() - 15 * 86400e3)
    }
}

const leaderboardFields = require('../models/Player/leaderboardFields');
const allowedStats = Object.keys(leaderboardFields);

const cachePlayerStats = async (id, doc) => {
    return await Promise.all(Object.entries(doc).map(async d => {
        const key = d[0];
        const value = d[1];

        if (!allowedStats.includes(key)) return;
        await redisClient.set(key, id, value);
    }));
}

const getNextChunk = async () => {
    const players = await playerDoc.find(queryFilter, { _id: 1 }).lean().sort({ xp: -1 }).skip(currentQueue * maxQueueSize).limit(maxQueueSize);

    players.forEach(p => queue.push(p._id));
    lastQueueChange = Date.now();

    return players;
}

const runNextBatch = async () => {
    const batch = queue.splice(0, maxBatchSize); // zero based indexes
    const players = await Promise.all(batch.map(async b => {
        const pit = await requestPlayer(b);
        await cachePlayerStats(b, pit.createPlayerDoc().toObject()); //doesn't actually insert it but works
    }));


    return players;
}

const start = async () => {
    if (!queue.length) {
        const data = await getNextChunk();
        lastQueueSize = data.length;
        currentQueue = currentQueue + 1; // so we can get the next 1000 players

        if (!data.length) {
            currentQueue = 0; //ran out of players to index restart
            await getNextChunk();
        }
    }

    runNextBatch();

    setTimeout(() => start(), batchTimeout); //loop again with delay 
}

const update = async () => estimatedCount = await playerDoc.find(queryFilter).countDocuments();
update();
setInterval(update, 300e3);

if (!Development) start(); //entry point

app.get('/', (req, res) => {
    res.json({ version: 1.0 });
});

app.get('/status', async (req, res) => {
    const currentPosition = ((currentQueue - 1) * maxQueueSize) + (lastQueueSize - queue.length);

    res.json({ currentPosition, estimatedCount, info: { currentQueueCount: currentQueue, maxBatchSize, maxQueueSize, batchTimeout, lastQueueChange } });
});

app.listen(5001, () => console.log('Indexer booted! Port 5001.'));