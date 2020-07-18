const Mystic = require('../models/Mystic');
const { dbToItem } = require('../apiTools/apiTools');
const {Pit:{Mystics}} = require('../frontEnd/src/pitMaster.json');

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
            if (a === 'tokens') and.push(fix({ tokens: finalB }));
            else if (a === 'lives') and.push(fix({ lives: finalB }));
            else if (a === 'maxlives') and.push(fix({ maxLives: finalB }));
            else if (a === 'color') and.push(fix({ nonce: { $mod: [5, b] } }));
            else if (a === 'nonce') and.push(fix({ nonce: finalB }));
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
            if (str in typeMap) types.push(fix(typeMap[str]));
            else flags.push(fix(str));
        }
    }
    if (enchants.length > 0) query.enchants = { $all: enchants };
    if (flags.length > 0) query.flags = { $all: flags };
    if (types.length > 0) query['item.id'] = { $in: types };
    if (and.length > 0) query.$and = and;
    const page = req.params.page || 0;
    Mystic
        .find(query)
        .limit(perPage)
        .skip(perPage * page)
        .sort('-lastseen')
        .then(docs => {
            const items = docs.map(dbToItem);
            res.status(200).json({ success: true, items });
        });
};

router.use('/:query/:page', itemSearch); //deprecated
router.use('/:query', itemSearch);

module.exports = router;