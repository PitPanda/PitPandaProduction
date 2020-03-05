const Player = require('../../models/Player');
const hypixelAPI = require('../../playerRequest');
const router = require('express').Router();

const perPage = 10;

const endpoint = (req,res)=>{
    const page = req.params.page || 0;
    Player
        .find({})
        .limit(perPage)
        .skip(perPage*page)
        .sort('-xp')
        .then(results=>{
            Promise.all(
                results.map(player=>
                    hypixelAPI(player._id))
            ).then(players=>
                res.status(200).json(players.map(player=>
                    player.levelFormattedName))
            )
        });
};

router.use('/:page', endpoint);
router.use('/', endpoint);

module.exports = router;