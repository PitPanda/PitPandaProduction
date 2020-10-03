const router = require('express').Router();
const getDoc = require('../apiTools/playerDocRequest');
const rateLimiter = require('../apiTools/rateLimiter');
const { cleanDoc } = require('../apiTools/apiTools');

router.get('/:uuid', rateLimiter(1), async (req, res) => {
    const user = await getDoc(req.params.uuid, {maxAge: Infinity});
    if (user.error) return res.status(400).json({ success: false });

    res.status(200).json({ success: true });
});

module.exports = router;
