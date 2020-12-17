const request = require('request');
const { APIerror } = require('./apiTools');
const Pit = require('../structures/Pit');
const HypixelUsage = require('../models/HypixelUsage');
const { DataResolver } = require('discord.js');

const batchSize = 10;
let count = 0;

const hypixelAPI = (() => {
    const { APIKeys: keys } = require('../settings.json');
    let i = 0;
    const getKey = () => {
        if (i === keys.length) i = 0;
        return keys[i++];
    }
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
        return Promise.race([new Promise((resolve) => {
            request(`https://api.hypixel.net/player?key=${getKey()}&${tag.length < 32 ? 'name' : 'uuid'}=${tag}`, (err, response, body) => {
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
            request(`https://api.hypixel.net/friends?key=${getKey()}&uuid=${uuid}`, (err, response, body) => {
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