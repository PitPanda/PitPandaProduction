const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const leaderboardGrabber = require('../apiTools/leaderboardGrabber');
const rateLimiter = require('../apiTools/rateLimiter');
router.get('/:type', rateLimiter(3), async (req, res) => {
    let size = req.query.pageSize ? Math.min(500, req.query.pageSize) : 100;
    const leaderboard = await leaderboardGrabber(req.params.type, req.query.page || 0, size);

    if (leaderboard.error) return res.status(400).json({ success: false, error: leaderboard.error||'Something went wrong.' });

    res.json({ success: true, leaderboard });
});
router.get('*', APIerror('Invalid Endpoint'));

module.exports = router;
