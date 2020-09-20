const { events } = require('../apiTools/mysticLogging');
const { APIerror } = require('../apiTools/apiTools');
const router = require('express').Router();

events.on('new', console.log)

router.ws('/', (ws) => {
    const cb = item => ws.send(JSON.stringify(item));
    events.on('new', cb);
    ws.on('close', () => events.removeListener('new', cb));
    ws.on('message', () => ws.send('3'));
});

router.use('/', APIerror('This is a websocket only endpoint'));

module.exports = router;
