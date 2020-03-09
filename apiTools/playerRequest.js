const request = require('request');
const {APIerror} = require('./apiTools');
const Pit = require('../structures/Pit');
const HypixelUsage = require('../models/HypixelUsage');

const batchSize = 10;
let count = 0;

/**
 * Constructor for API utilty function
 */
function hypixelAPIconstructor(){
    const keys = require('../keys');
    let i = 0;
    const getKey = () => {
        if(i==keys.length)i=0;
        return keys[i++];
    }
    return (tag => {
        if(count===batchSize){
            HypixelUsage.findOneAndUpdate(
                {date:Math.floor(Date.now()/86400e3)},
                {$inc:{count}},
                {upsert:true}
            ).catch(console.error);
            count=1;
        }else count++;
        return Promise.race([new Promise((resolve)=>{
            request(`https://api.hypixel.net/player?key=${getKey()}&${tag.length<32?'name':'uuid'}=${tag}`, (err, response, body)=>{
                if(err || (Math.floor(response.statusCode/100)!=2)) resolve({success:false,error:err||`API returned with code ${response.statusCode}`});
                else resolve(new Pit(JSON.parse(body)));
            });
        }),new Promise((resolve)=>{
            setTimeout(()=>resolve(APIerror("Request Timed Out").json),6000);
        })]);
    });
}
const tmp = hypixelAPIconstructor();
/**
 * Return an object containing the api response or error info
 * @param {string} tag UUID or Username of the user you are getting
 * @returns {Promise<Pit>} JSON result of the api call
 */
const hypixelAPI = tag => tmp(tag);
module.exports = hypixelAPI;