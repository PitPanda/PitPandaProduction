const router = require('express').Router();
const proxy = require('express-http-proxy');

const imageApiUrl = process.env.IMAGE_API_URL || 'localhost:5002';

router.use(proxy(imageApiUrl, {
    proxyErrorHandler: function(err, res, next) {
        console.error('Image API Proxy Error:', err.message);
        res.status(500).json({ success: false, error: 'Image API is currently unreachable' });
    }
}));

module.exports = router;
