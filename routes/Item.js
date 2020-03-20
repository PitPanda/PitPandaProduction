const router = require('express').Router();

const Mystic = require('../models/Mystic');
const { dbToItem } = require('../apiTools/apiTools');
const hypixelAPI = require('../apiTools/playerRequest');
const Pit = require('../structures/Pit');

//not used
//const Item = require('../structures/Item');

router.get('/:id', async (req, res) => {
    const itemData = await Mystic.findById(req.params.id);
    if (!itemData) return res.status(404).json({ success: false, err: 'No Item Found.' });

    if (req.query.extended) {
        const owner = await hypixelAPI(item.owner);

        const target = new Pit(owner);
        if (target.error) return res.json({ success: false, error: target.error });

        target.loadInventorys();

        let result = dbToItem(item);

        result.formatted = target.levelFormattedName;
        result.ownername = target.name;

        return res.status(200).json({ success: true, item: result });
    } else {
        return res.status(200).json({ success: true, item: dbToItem(item) });
    }
});

module.exports = router;

/*

const router = require('express').Router();
const hypixelAPI = require('./playerRequest');
const Pit = require('./structures/Pit');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(json=>{
        const target = new Pit(json);
        res.status(200);
        if(target.error) res.json({success:false,error:target.error});
        else {
            target.loadInventorys().then(promises=>
                res.json({success:true,data:target})
            );
        }
    });
});

module.exports = router;
*/