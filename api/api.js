const router = require('express').Router();
const players = require('./players');
const tradecenter = require('./tradecenter');
const tools = require('./apiTools');

router.use('/players',players);
router.use('/tradecenter',tradecenter);

router.use('*', tools.APIerror('Invalid Endpoint'))

module.exports = router;