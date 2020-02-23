const Mystic = require('./models/Mystic');
const Item = require('./structures/Item');
const {dbToItem} = require('./apiTools');

const router = require('express').Router();

const perPage = 72;

const itemSearch = (req,res)=>{
    const query = req.params.query.split(',').map(str=>{
        const end = /[0-9]{1,}$/.exec(str);
        if(end) return {
            key: str.substring(0,end.index),
            level: Number(str.substring(end.index))
        }
        else return{};
    });
    const page = req.params.page || 0;
    if(!query.every(q=>typeof q.key === 'string' && typeof q.level === 'number')) return res.status(400).send({error:'invalid query'})
    Mystic
        .find({
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
        })
        .limit(perPage)
        .skip(perPage*page)
        .sort('-lastseen')
        .then(docs=>{
            const items = docs.map(dbToItem);
            res.status(200).json({success:true,items});
        });
};

router.use('/:query/:page', itemSearch);
router.use('/:query', itemSearch);


module.exports = router;