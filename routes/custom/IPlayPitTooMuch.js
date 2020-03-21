const router = require('express').Router();
const hypixelAPI = require('../../apiTools/playerRequest');

router.use('/:tag', async (req, res) => {
    const target = await hypixelAPI(req.params.tag)

    if (target.error) return res.json({ success: false, error: target.error });

    await target.NBTInventoryPromise;

    const items = Object.values(target.simplified_inventories).flat(1).filter(item => item.name);
    data = { name: target.levelFormattedName.replace(/§./g, ''), items };
    res.json({ success: true, data });
});

module.exports = router;