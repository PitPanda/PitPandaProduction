const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const playerItems = require('./PlayerItems');
const wonderpants = require('./Wonderpants');
const rainmeter = require('./Rainmeter');

router.use('/playerItems', playerItems);
router.use('/wonderpants', wonderpants);
router.use('/rainmeter', rainmeter);
router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;