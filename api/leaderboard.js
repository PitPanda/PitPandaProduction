const router = require('express').Router();
const {APIerror} = require('../apiTools/apiTools');
const leaderboardGrabber = require('../apiTools/leaderboardGrabber');

const endpoint = (req,res)=>{
    leaderboardGrabber(req.params.type,req.params.page || 0)
        .then(data=>res.status(200).json({success:true,data}))
        .catch(error=>res.status(400).json({success:false,error}));
};

router.use('/:type/:page',endpoint);
router.use('/:type',endpoint);

router.use('*', APIerror('Invalid Endpoint'))

module.exports = router;
