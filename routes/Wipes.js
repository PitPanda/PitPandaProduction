const router = require('express').Router();
const WipeDetection = require('../models/WipeDetection');

// GET /api/wipes - list all detected wipes, newest first
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const skip = (page - 1) * limit;

        const [wipes, total] = await Promise.all([
            WipeDetection.find().sort({ detectedAt: -1 }).skip(skip).limit(limit).lean(),
            WipeDetection.countDocuments(),
        ]);

        res.json({ success: true, data: { wipes, total, page, limit } });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/wipes/:uuid - wipe history for a specific player
router.get('/:uuid', async (req, res) => {
    try {
        const wipes = await WipeDetection.find({ uuid: req.params.uuid })
            .sort({ detectedAt: -1 })
            .lean();
        res.json({ success: true, data: wipes });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
