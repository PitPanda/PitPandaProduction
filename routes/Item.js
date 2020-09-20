const router = require('express').Router();
const rateLimiter = require('../apiTools/rateLimiter');
const Mystic = require('../models/Mystic');
const { dbToItem } = require('../apiTools/apiTools');
const hypixelAPI = require('../apiTools/playerRequest');
const Pit = require('../structures/Pit');

router.get('/:id', rateLimiter(2), async (req, res) => {
    const item = await Mystic.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, err: 'No Item Found.' });

    if (req.query.extended) {
        const owner = await hypixelAPI(item.owner);

        const target = new Pit(owner);
        if (target.error) return res.json({ success: false, error: target.error });

        target.loadInventorys();

        let result = (req.query.raw === 'true') ? docs : docs.map(dbToItem);

        result.formatted = target.levelFormattedName;
        result.ownername = target.name;

        return res.status(200).json({ success: true, item: result });
    } else {
        return res.status(200).json({ success: true, item: (req.query.raw !== 'false') ? item : dbToItem(item) });
    }
});

module.exports = router;
