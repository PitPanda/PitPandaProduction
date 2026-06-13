const router = require('express').Router();

const rateLimiter = require('../apiTools/rateLimiter');
const getPlayerData = require('../apiTools/getPlayerData');

router.get('/:tag', rateLimiter(10, true), async (req, res) => {
    const result = await getPlayerData(req.params.tag);
    if (!result.success) return res.status(400).json(result);
    res.status(200).json(result);
});

module.exports = router;
