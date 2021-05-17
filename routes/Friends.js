const router = require('express').Router();
const { APIerror } = require('../apiTools/apiTools');
const rateLimiter = require('../apiTools/rateLimiter');
const HypixelAPI = require('../apiTools/playerRequest');

router.use('/:uuid', rateLimiter(8), async (req, res) => {
    const uuid = req.params.uuid;
    const result = await HypixelAPI.friends(uuid);
    if(!result.success) return res.send(result);
    const friends = result.records.map(rel => ({
        started: rel.started,
        uuid: rel.uuidReceiver !== uuid ? rel.uuidReceiver : rel.uuidSender,
    }));
    res.send({
        success: true,
        friends,
    })
});

router.use('*', APIerror('Invalid Endpoint'));

module.exports = router;