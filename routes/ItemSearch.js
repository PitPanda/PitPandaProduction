const Mystic = require('../models/Mystic');
const { dbToItem } = require('../apiTools/apiTools');
const {Pit:{Mystics}} = require('../frontEnd/src/pitMaster.json');
const rateLimiter = require('../apiTools/rateLimiter');
const classes = {};
Object.entries(Mystics).forEach(([key,enchant])=>{
    enchant.Classes.forEach(cls=>{
        if(!classes[cls])classes[cls]=[];
        classes[cls].push(key);
    })
});

const router = require('express').Router();

const perPage = 72;

const typeMap = {
    bow: 261,
    sword: 283,
    pants: 300
}

const formatQueryNum = {
    exact: value => value,
    greater: value => ({ $gte: value }),
    lesser: value => ({ $lte: value }),
}

const itemSearch = (req, res) => {
    let query = {};
    let enchants = [];
    let flags = [];
    let types = [];
    let and = [];
    let or = [];

    const queryString = req.query.query || req.params.query;
    for (let str of queryString.toLowerCase().split(',')) {
        const not = str.startsWith('!');
        if(not) str = str.substring(1);
        const fix = not ? (q => ({$not: q})) : (q => q); 
        if (str.startsWith('uuid')) {
            query.owner = fix(str.substring(4));
            continue;
        }
        const end = /-?[0-9]{1,}(\+|-)?$/.exec(str);
        if (end) {
            const a = str.substring(0, end.index);
            let b;
            let direction = 'exact';
            const lastChar = str[str.length - 1];
            if (lastChar === '-' || lastChar === '+') {
                b = Number(str.substring(end.index, str.length - 1));
                direction = (lastChar === '+') ? 'greater' : 'lesser';
            } else {
                b = Number(str.substring(end.index));
            }
            const finalB = formatQueryNum[direction](b);
            if (a === 'tokens') and.push({ tokens: not ? {$not:{$eq:finalB}} : finalB });
            else if (a === 'lives') and.push({ lives: not ? {$not:{$eq:finalB}} : finalB });
            else if (a === 'maxlives') and.push({ maxLives: not ? {$not:{$eq:finalB}} : finalB });
            else if (a === 'color') and.push({ nonce: not ? {$not:{ $mod: [5, b] }} : { $mod: [5, b] } });
            else if (a === 'nonce') and.push({ nonce: not ? {$not:{$eq:finalB}} : finalB });
            else if(a in classes) enchants.push(fix({
                $elemMatch: {
                    key: {$in:classes[a]},
                    level: finalB
                }
            }));
            else enchants.push(fix({
                $elemMatch: {
                    key: a,
                    level: finalB
                }
            }));
        } else {
            if (str in typeMap) types.push(not ? {$not:{$eq:typeMap[str]}} : typeMap[str]);
            else flags.push(not ? {$not:{$eq:str}} : str);
        }
    }
    types.forEach(type=>or.push({'item.id':type}));
    enchants.forEach(ench=>and.push({enchants:ench}));
    flags.forEach(flag=>and.push({flags:flag}));
    if (and.length > 0) query.$and = and;
    if (or.length > 0) query.$or = or;
    const page = req.params.page || req.query.page || 0;
    Mystic
        .find(query)
        .limit(perPage)
        .skip(perPage * page)
        .sort('-lastseen')
        .then(docs => {
            const items = (req.query.raw === 'true') ? docs : docs.map(dbToItem);
            res.status(200).json({ success: true, items });
        });
};

router.use('/:query/:page', rateLimiter(6), itemSearch); //deprecated
router.use('/:query', rateLimiter(6), itemSearch);

module.exports = router;