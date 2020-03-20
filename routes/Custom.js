const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const IPlayPitTooMuch = require('./custom/IPlayPitTooMuch');

router.get('/iplaypittoomuch', IPlayPitTooMuch);
router.get('*', APIerror('Invalid Endpoint'));

module.exports = router;
