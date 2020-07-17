const router = require('express').Router();
const Player = require('../models/Player');

router.get('/:tag', async (req, res) => {
    const users = await Player.find({discord:req.params.tag});

    res.status(200).json({ success: true, users});
});

module.exports = router;