const Mystic = require('../models/Mystic');
const Item = require('../structures/Item');
const {dbToItem} = require('../apiTools');
const hypixelAPI = require('../playerRequest');
const Pit = require('../structures/Pit');

const router = require('express').Router();
router.use('/:id', (req,res)=>{
    
    Mystic.findById(req.params.id,(err,item)=>{
        if(err) return res.status(400).json({success:false,err});
        if(!item) return res.status(404).json({success:false,err:'no item found'});
        if(req.query.extended){
            hypixelAPI(item.owner).then(json=>{
                const target = new Pit(json);
                res.status(200);
                if(target.error) res.json({success:false,error:target.error});
                else {
                    target.loadInventorys();
                    let result = dbToItem(item);
                    result.formatted = target.levelFormattedName;
                    result.ownername = target.name;
                    return res.status(200).json({success:true,item:result});
                }
            });
        }else{
            return res.status(200).json({success:true,item:dbToItem(item)});
        }
    });
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