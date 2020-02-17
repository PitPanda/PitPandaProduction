const Mystic = require('./models/Mystic');
const Item = require('./structures/Item');
const {dbToItem} = require('./apiTools');

const router = require('express').Router();
router.use('/:id', (req,res)=>{
    Mystic.findById(req.params.id,(err,item)=>{
        if(err) return res.status(400).json(err);
        if(!item) return res.status(404).json({err:'no item found'});
        res.status(200).json(dbToItem(item));
    });
});

module.exports = router;