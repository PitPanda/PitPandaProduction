const Player = require('../../models/Player');
const router = require('express').Router();
const getDoc = require('../../apiTools/playerDocRequest');

const perPage = 25;

const endpoint = (req,res)=>{
    const page = req.params.page || 0;
    Player
        .find({exempt:{$exists:false}})
        .limit(perPage)
        .skip(perPage*page)
        .sort('-xp')
        .then(results=>{
            Promise.all(
                results.map(player=>getDoc(player._id))
            ).then(players=>
                res.status(200).json(players.map(player=>({uuid:player._id,name:player.displayName,xp:player.xp})))
            )
        });
};

router.use('/:page', endpoint);
router.use('/', endpoint);

module.exports = router;