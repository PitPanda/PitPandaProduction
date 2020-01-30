const express = require('express');
const app = express();
const api = require('./api/api');

app.use(express.static('frontEnd/build'));

app.use('/api', api);

app.get('*', (req,res)=>res.status(200).sendFile(__dirname + "/frontEnd/build/index.html"));

app.listen(80, () => console.log(`Pit Panda listening on port 80!`));