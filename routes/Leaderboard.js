const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const leaderboardGrabber = require('../apiTools/leaderboardGrabber');

router.get('/:type', async (req, res) => {
    const leaderboard = await leaderboardGrabber(req.params.type, req.query.page || 0);

    if (leaderboard.error) return res.status(400).json({ success: false, error: leaderboard.error||'Something went wrong.' });

    res.json({ success: true, leaderboard });
});
router.get('*', APIerror('Invalid Endpoint'));

module.exports = router;
