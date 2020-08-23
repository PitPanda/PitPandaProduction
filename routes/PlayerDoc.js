const router = require('express').Router();
const getDoc = require('../apiTools/playerDocRequest');
const rateLimiter = require('../apiTools/rateLimiter');
const { cleanDoc } = require('../apiTools/apiTools');

router.get('/:uuid', rateLimiter(3), async (req, res) => {
    const maxAge = (req.query.maxAge ? Math.max(Number(req.params.maxAge),900) : 86400) * 1e3;
    const user = await getDoc(req.params.uuid, {maxAge});
    if (user.error) return res.status(400).json({ success: false, error: user.error });

    res.status(200).json({ success: true, Doc: cleanDoc(user) });
});

module.exports = router;
