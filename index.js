const express = require('express');
const app = express();
const api = require('./routes');
const mongoose = require('mongoose');
const {dbLogin, Development} = require('./settings.json');
require('./discordBot');
require('./forumsTracker');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

app.use(express.static('frontEnd/build'));

app.use('/api', api);
app.use('/pitReference', (req, res) => res.status(200).sendFile(__dirname + "/frontEnd/src/pitMaster.json"));
app.use('*', (req, res) => res.status(200).sendFile(__dirname + "/frontEnd/build/index.html"));

app.listen(5000, () => console.log(`Pit Panda has just booted! Port ${5000}.`));