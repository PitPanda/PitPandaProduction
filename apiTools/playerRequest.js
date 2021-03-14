const request = require('request');
const { APIerror } = require('./apiTools');
const Pit = require('../structures/Pit');
const HypixelUsage = require('../models/HypixelUsage');
const Player = require('../models/Player');

const batchSize = 10;
let count = 0;

const hypixelAPI = (() => {
    const logRequest = () => {
        if (count === batchSize) {
            HypixelUsage.findOneAndUpdate(
                { date: Math.floor(Date.now() / 86400e3) },
                { $inc: { count } },
                { upsert: true }
            ).catch(console.error);
            count = 1;
        } else count++;
    }
    /**
     * Return an object containing the api response or error info
     * @param {string} tag UUID or Username of the user you are getting
     * @returns {Promise<Pit>} Pit Object constructed from result
     */
    const player = tag => {
        logRequest();
        return Promise.race([new Promise(async (resolve) => {
            if(tag.length < 32) {
                const doc = await Player.findOne({nameLower:tag.toLowerCase()}, {_id:1});
                if(doc) tag = doc._id;
            }
            request(`https://api.hypixel.net/player?key=${process.env.APIKEY}&${tag.length < 32 ? 'name' : 'uuid'}=${tag}`, (err, response, body) => {
                if (err || (Math.floor(response.statusCode / 100) != 2)) resolve({ success: false, error: err || `API returned with code ${response.statusCode}` });
                else try{
                    resolve(new Pit(JSON.parse(body)));
                }catch(e){
                    resolve({success: false, error: `API returned with code ${response.statusCode}`});
                }
            });
        }), new Promise((resolve) => {
            setTimeout(() => resolve(APIerror("Request Timed Out").json), 60e3);
        })]);
    };
    /**
     * Return an object containing the api response or error info
     * @param {string} tag UUID or Username of the user you are getting
     * @returns {Promise<Any>} JSON result of the api call
     */
    const friends = uuid => {
        logRequest();
        return Promise.race([new Promise((resolve) => {
            request(`https://api.hypixel.net/friends?key=${process.env.APIKEY}&uuid=${uuid}`, (err, response, body) => {
                if (err || (Math.floor(response.statusCode / 100) != 2)) resolve({ success: false, error: err || `API returned with code ${response.statusCode}` });
                else try{
                    resolve(JSON.parse(body));
                }catch(e){
                    resolve({success: false, error: `API returned with code ${response.statusCode}`});
                }
            });
        }), new Promise((resolve) => {
            setTimeout(() => resolve(APIerror("Request Timed Out").json), 60e3);
        })]);
    }
    return { player, friends };
})();
module.exports = hypixelAPI;