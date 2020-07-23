const router = require('express').Router();
const getDoc = require('../apiTools/playerDocRequest');
const rateLimiter = require('../apiTools/rateLimiter');
router.get('/:uuid', rateLimiter(3), async (req, res) => {
    const user = await getDoc(req.params.uuid, {maxAge:(req.query.age||86400)*1e3});
    if (user.error) return res.status(400).json({ success: false, error: user.error });

    res.status(200).json({ success: true, Doc: user });
});

module.exports = router;