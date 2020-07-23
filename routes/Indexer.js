const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const fetch = require('node-fetch');
const rateLimiter = require('../apiTools/rateLimiter');

router.use('/', rateLimiter(1), async (req, res) => {
    try{
        const response = await fetch('http://localhost:5001/status');
        const data = await response.json();
        res.status(200).json({ success: true, data });
    }catch(error){
        res.status(500).json({ success: false, error })
    }
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;