const router = require('express').Router();
const hypixelAPI = require('../../apiTools/playerRequest');
const Player = require('../../models/Player');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(target=>{
        res.status(200);
        if(target.error) res.json({success:false,error:target.error});
        else {
            target.NBTInventoryPromise.then(()=>{
                const items = Object.values(target.simplified_inventories).flat(1).filter(item=>item.name);
                data = {name:target.levelFormattedName.replace(/§./g,''),items};
                res.json({success:true,data});
            });
        }
    });
});

module.exports = router;