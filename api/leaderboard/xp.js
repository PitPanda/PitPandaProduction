const Player = require('../../models/Player');
const router = require('express').Router();
const getUsername = require('../../apiTools/usernameRequest');

const perPage = 25;

const endpoint = (req,res)=>{
    const page = req.params.page || 0;
    Player
        .find({})
        .limit(perPage)
        .skip(perPage*page)
        .sort('-xp')
        .then(results=>{
            Promise.all(
                results.map(player=>getUsername(player._id))
            ).then(players=>
                res.status(200).json(players.map(player=>({uuid:player.uuid,name:player.leveled})))
            )
        });
};

router.use('/:page', endpoint);
router.use('/', endpoint);

module.exports = router;