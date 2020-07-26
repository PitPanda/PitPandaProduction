const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const fetch = require('node-fetch');
const rateLimiter = require('../apiTools/rateLimiter');

router.use('/', rateLimiter(1), async (req, res) => {
    try{
        const response = await fetch('http://localhost:5001/');
        const data = await response.json();
        res.status(200).json({ success: true, data: { online: true, ...data } });
    }catch(error){
        res.status(200).json({ success: true, data: { online: false } })
    }
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;