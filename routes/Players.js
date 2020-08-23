const router = require('express').Router();

const hypixelAPI = require('../apiTools/playerRequest');
const Player = require('../models/Player');
const rateLimiter = require('../apiTools/rateLimiter');
const { cleanDoc } = require('../apiTools/apiTools');

router.get('/:tag', rateLimiter(10), async (req, res) => {
    const target = await hypixelAPI(req.params.tag);

    if (target.error) return res.status(400).json({ success: false, error: target.error });

    const [, players] = await Promise.all([
        target.loadInventorys(), 
        Player.find(
            {
                $or:[
                    {
                        'flag.alts':{
                            $elemMatch:{
                                $eq:target.uuid,
                            },
                        },
                    },
                    {
                        'profileDisplay.alts':{
                            $elemMatch:{
                                $eq:target.uuid,
                            },
                        },
                    },
                    {
                        '_id':target.uuid,
                    },
                ],
            }
        )
    ]);

    data = {};

    data.displays = [];

    const self = players.find(d=>d._id === target.uuid);
    if (self) {
        if(self.profileDisplay) data.displays.push({
            ...self.toJSON().profileDisplay,
            display_type: 'plaque',
        });
        if(self.flag) data.displays.push({
            ...self.toJSON().flag,
            addedby: undefined,
            timestamp: undefined,
            evidence: undefined,
            display_type: 'flag',
        });
    }
    players.filter(d=>d._id !== target.uuid).map(notSelf => {
        if(notSelf.profileDisplay && notSelf.profileDisplay.alts && notSelf.profileDisplay.alts.includes(target.uuid)) data.displays.push({
            ...notSelf.toJSON().profileDisplay, 
            alts: undefined, 
            main: notSelf._id,
            display_type: 'plaque',
        });
        if(notSelf.flag && notSelf.flag.alts && notSelf.flag.alts.includes(target.uuid)) data.displays.push({
            ...notSelf.toJSON().flag,
            addedby: undefined,
            timestamp: undefined,
            evidence: undefined,
            alts: undefined,
            main: notSelf._id,
            display_type: 'flag',
        });
    });

    data.uuid = target.uuid;
    data.name = target.name;
    data.bounty = target.bounty;
    data.online = target.online;
    data.lastSave = target.lastSave;
    data.lastLogout = target.lastLogout;
    data.formattedName = target.formattedName;
    data.formattedLevel = target.formattedLevel;
    data.currentGold = target.currentGold;
    data.playtime = target.playtime;
    data.inventories = target.inventories;
    data.prestiges = target.prestiges;
    data.xpProgress = target.xpProgress;
    data.goldProgress = target.goldProgress;
    data.renownProgress = target.renownProgress;
    data.doc = cleanDoc(self);
    res.status(200).json({ success: true, data });
});

module.exports = router;