const router = require('express').Router();
const proxy = require('express-http-proxy');

const imageApiUrl = process.env.IMAGE_API_URL || 'localhost:5002';

router.use(proxy(imageApiUrl))

module.exports = router;
