const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const profile = require('./profile');

router.use('/profile', profile);

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;