const Player = require('../models/Player');
const fields = require('../models/Player/leaderboardFields');
const RedisClient = require('../utils/RedisClient');
const redisClient = new RedisClient(0);

const leaderboardGrabber = async (primaryKey, page = 0, perPage = 100) => {
    page = parseInt(page)
    if (!(primaryKey in fields)) return {error:'Invalid leaderboard endpoint'};
    const res = (await redisClient.getRange(primaryKey, perPage*page, perPage*(page+1)))
        .reduce((acc,current)=>{
            const last = acc[acc.length-1];
            if( !last || last.length===2) acc.push([current]);
            else last.push(current);
            return acc;
        },[]);
    const names = await Player.find({ _id: { $in: res.map(([id])=>id) } }, { _id: 1, colouredName: 1, formattedLevel: 1 });
    return res.filter(Boolean).map(([id,score])=>(
        {
            uuid: id,
            name: names.find(name=>name._id===id).displayName,
            score: Number(score),
        }
    ));
};

module.exports = leaderboardGrabber;