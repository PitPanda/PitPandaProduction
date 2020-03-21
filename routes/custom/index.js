const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const IPlayPitTooMuch = require('./IPlayPitTooMuch');

router.use('/iplaypittoomuch', IPlayPitTooMuch);
router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;