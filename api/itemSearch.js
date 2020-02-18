const Mystic = require('./models/Mystic');
const Item = require('./structures/Item');
const {dbToItem} = require('./apiTools');

const router = require('express').Router();
router.use('/:query', (req,res)=>{
    const query = req.params.query.split(',').map(str=>{
        const end = /[0-9]{1,}$/.exec(str);
        if(end) return {
            key: str.substring(0,end.index),
            level: Number(str.substring(end.index))
        }
        else return{};
    });
    query.forEach(q=>console.log(typeof q.key,typeof q.level));
    console.log(query);
    if(!query.every(q=>typeof q.key === 'string' && typeof q.level === 'number')) return res.status(400).send({error:'invalid query'})
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
        res.status(200).send(items);
    });
});

module.exports = router;