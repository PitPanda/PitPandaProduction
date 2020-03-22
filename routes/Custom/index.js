const router = require('express').Router();
const { APIerror } = require('../../apiTools/apiTools');
const inventoryContents = require('./inventoryContents');

router.use('/inventorycontents', inventoryContents);
router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;