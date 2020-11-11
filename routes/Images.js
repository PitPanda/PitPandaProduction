const router = require('express').Router();
const proxy = require('express-http-proxy');

router.use(proxy('localhost:5002'))

module.exports = router;
