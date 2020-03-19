const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const leaderboardGrabber = require('../apiTools/leaderboardGrabber');

const endpoint = async (req, res) => {
    const leaderboard = await leaderboardGrabber(req.params.type, req.params.page || 0);

    if (!leaderboard) return res.status(400).json({ success: false, error: 'Something went wrong.' });

    res.json({ success: true, leaderboard });
};

router.get('/:type/:page', endpoint);
router.get('/:type', endpoint);
router.get('*', APIerror('Invalid Endpoint'));

module.exports = router;
