const mongoose = require('mongoose');
const { dbLogin, Development } = require('../settings.json');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

const requestPlayer = require('../apiTools/playerRequest');
const playerDoc = require('../models/Player');

//constants
const maxQueueSize = 1000;
const maxBatchSize = 1;
const batchTimeout = 1000;

let currentQueue = 0;

const queue = [];

const getNextChunk = async () => {
    const players = await playerDoc.find({ xp: { $gte: 65950 } }, { _id: 1 }).lean().sort({ xp: -1 }).skip(currentQueue * maxQueueSize).limit(maxQueueSize);

    players.forEach(p => queue.push(p._id));

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