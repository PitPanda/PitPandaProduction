const router = require('express').Router();
const {APIerror} = require('../apiTools');
const IPlayPitTooMuch = require('./custom/IPlayPitTooMuch');

router.use('/iplaypittoomuch',IPlayPitTooMuch);

router.use('*', APIerror('Invalid Endpoint'))

module.exports = router;
