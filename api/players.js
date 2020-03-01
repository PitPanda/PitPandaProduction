const router = require('express').Router();
const {hypixelAPI} = require('./apiTools');
const Pit = require('./structures/Pit');

router.use('/:tag', (req,res)=>{
    hypixelAPI(req.params.tag).then(json=>{
        const target = new Pit(json);
        res.status(200);
        if(target.error) res.json({success:false,error:target.error});
        else {
            target.loadInventorys().then(promises=>
                res.json({success:true,data:target})
            );
        }
    });
});

let uuids = require('./uuids.json');
console.log(uuids);
function pop(){
    const uuid = uuids.pop();
    console.log(uuid);
    hypixelAPI(uuid).then(json=>new Pit(json));
    if(uuids.length) setTimeout(pop,400);
}
setTimeout(pop,400)

module.exports = router;