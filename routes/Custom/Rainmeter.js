const router = require('express').Router();
const rateLimiter = require('../../apiTools/rateLimiter');

const hypixelAPI = require('../../apiTools/playerRequest');
const getDoc = require('../../apiTools/playerDocRequest');

router.get('/:tag', rateLimiter(3), async (req, res) => {
    const target = await getDoc(req.params.tag);
    let data = {};
    if (target.error) return res.status(400).json({ error: target.error });
    data.level = target.displayName.substring(0,target.displayName.indexOf(' ')).replace(/§./g,'');
    data.gold = Math.round(target.gold).toLocaleString()+'g';
    res.status(200).json( data );
});

module.exports = router;