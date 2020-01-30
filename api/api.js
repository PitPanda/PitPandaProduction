const router = require('express').Router();
const players = require('./players');
const tools = require('./apiTools');

router.use('/players',players);

router.use('*', tools.error('Invalid Endpoint'))

module.exports = router;