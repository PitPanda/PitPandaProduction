const router = require('express').Router();
const {APIerror} = require('../apiTools/apiTools');
const xp = require('./leaderboard/xp');


router.use('/xp',xp);

router.use('*', APIerror('Invalid Endpoint'))

module.exports = router;
