const { events } = require('../apiTools/mysticLogging');
const { APIerror } = require('../apiTools/apiTools');
const router = require('express').Router();

router.ws('/', (ws) => {
    const cb = item => ws.send(JSON.stringify(item));
    events.on('mystic', cb);
    ws.on('close', () => events.removeListener('mystic', cb));
    ws.on('message', () => ws.send('3'));
});

router.use('/', APIerror('This is a websocket only endpoint'));

module.exports = router;
