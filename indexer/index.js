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
const maxQueueSize = 1000;
const maxBatchSize = 1;
const batchTimeout = 1000;

let currentQueue = 0;
let lastQueueChange = 0;

const queue = [];

const getNextChunk = async () => {
    const players = await playerDoc.find({ xp: { $gte: 65950 } }, { _id: 1 }).lean().sort({ xp: -1 }).skip(currentQueue * maxQueueSize).limit(maxQueueSize);

    players.forEach(p => queue.push(p._id));
    lastQueueChange = Date.now();

    return players;
}

const runNextBatch = async () => {
    const batch = queue.splice(0, maxBatchSize); // zero based indexes
    const players = await Promise.all(batch.map(async b => await requestPlayer(b)));

    return players;
}

const start = async () => {
    if (!queue.length) {
        const data = await getNextChunk();
        currentQueue = currentQueue + 1; // so we can get the next 1000 players
        
        if (!data.length) currentQueue = 0; //ran out of players to index restart
        await getNextChunk();
    }

    runNextBatch();

    setTimeout(() => start(), batchTimeout); //loop again with delay 
}

start(); //entry point

app.get('/', (req, res) => {
    res.json({ version: 1.0 });
});

app.get('/status', async (req, res) => {
    const estimatedCount = await playerDoc.estimatedDocumentCount();
    const currentPosition = ((currentQueue - 1) * maxQueueSize) + (maxQueueSize - queue.length);

    res.json({ currentPosition, estimatedCount, info: { currentQueueCount: currentQueue, maxBatchSize, maxQueueSize, batchTimeout, lastQueueChange } });
});

app.listen(5001, () => console.log('Indexer booted! Port 5001.'));