const Mystic = require('./models/Mystic');
const Item = require('./structures/Item');
const {dbToItem} = require('./apiTools');

const router = require('express').Router();
router.use('/:query', (req,res)=>{
    const query = req.params.query.split(',').map(str=>{
        const end = /[0-9]/.exec(str).index;
        return {
            key: str.substring(0,end),
            level: Number(str.substring(end))
        }
    });
    Mystic.find({
        enchants:{
            $all:query.map(({key,level})=>({
                $elemMatch:{
                    key,
                    level:{
                        $gte:level
                    }
                }
            }))
        }
    }).then(docs=>{
        const items = docs.map(dbToItem);
        res.send(items);
    });
});

module.exports = router;