const request = require('request');

function hypixelAPI(){
    const keys = require('./keys');
    let i = 0;
    const getKey = () => {
        if(i==keys.length)i=0;
        return keys[i++];
    }
    return (tag => {
        return Promise.race([new Promise((resolve)=>{
            request(`https://api.hypixel.net/player?key=${getKey()}&${tag.length<32?'name':'uuid'}=${tag}`, (err, {statusCode}, body)=>{
                if(err || (Math.floor(statusCode/100)!=2)) resolve({success:false,error:err||`API returned with code ${statusCode}`});
                else resolve(JSON.parse(body));
            });
        }),new Promise((resolve)=>{
            setTimeout(()=>resolve({success:false,error:"Request Timed Out"}),6000);
        })]);
    });
    
} module.exports.hypixelAPI = hypixelAPI();

const apiError = message => ((req,res)=>res.status(404).json({success:false,error:message}));
module.exports.error = apiError;