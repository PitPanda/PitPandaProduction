const fetch = require('node-fetch');
const { APIerror } = require('./apiTools');
const Pit = require('../structures/Pit');
const HypixelUsage = require('../models/HypixelUsage');
const Player = require('../models/Player');

const batchSize = 10;
let count = 0;

const responseCache = new Map();
const inflight = new Map();
const CACHE_TTL = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of responseCache) {
        if (now - entry.ts > CACHE_TTL) responseCache.delete(key);
    }
}, CACHE_TTL);

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

    const getHypixelResponse = (tag) => {
        const cacheKey = tag.toLowerCase();

        const cached = responseCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            return Promise.resolve(cached);
        }

        if (inflight.has(cacheKey)) {
            return inflight.get(cacheKey);
        }

        logRequest();
        const promise = Promise.race([new Promise(async (resolve) => {
            let resolvedTag = tag;
            if (resolvedTag.length < 32) {
                const doc = await Player.findOne({nameLower: resolvedTag.toLowerCase()}, {_id: 1});
                if (doc) resolvedTag = doc._id;
            }
            try {
                const response = await fetch(`https://api.hypixel.net/player?key=${process.env.APIKEY}&${resolvedTag.length < 32 ? 'name' : 'uuid'}=${resolvedTag}`);
                if (Math.floor(response.status / 100) !== 2) {
                    resolve({ error: `API returned with code ${response.status}` });
                    return;
                }
                const body = await response.json();
                const entry = { body, ts: Date.now() };
                responseCache.set(cacheKey, entry);
                if (body.player && body.player.uuid) {
                    const uuid = body.player.uuid.toLowerCase().replace(/-/g, '');
                    if (uuid !== cacheKey) responseCache.set(uuid, entry);
                }
                resolve(entry);
            } catch (e) {
                resolve({ error: e.message });
            }
        }), new Promise(resolve => {
            setTimeout(() => resolve({ error: 'Request Timed Out' }), 60e3);
        })]).finally(() => inflight.delete(cacheKey));

        inflight.set(cacheKey, promise);
        return promise;
    };

    /**
     * Return an object containing the api response or error info
     * @param {string} tag UUID or Username of the user you are getting
     * @returns {Promise<Pit>} Pit Object constructed from result
     */
    const player = tag => getHypixelResponse(tag).then(entry => {
        if (entry.error) return { success: false, error: entry.error };
        return new Pit(entry.body);
    });

    /**
     * Return an object containing the api response or error info
     * @param {string} tag UUID or Username of the user you are getting
     * @returns {Promise<Any>} JSON result of the api call
     */
    const friends = uuid => {
        logRequest();
        return Promise.race([new Promise(async (resolve) => {
            try {
                const response = await fetch(`https://api.hypixel.net/friends?key=${process.env.APIKEY}&uuid=${uuid}`);
                if (Math.floor(response.status / 100) !== 2) {
                    resolve({ success: false, error: `API returned with code ${response.status}` });
                    return;
                }
                const body = await response.json();
                resolve(body);
            } catch (e) {
                resolve({ success: false, error: e.message });
            }
        }), new Promise((resolve) => {
            setTimeout(() => resolve(APIerror("Request Timed Out").json), 60e3);
        })]);
    }
    return { player, friends };
})();
module.exports = hypixelAPI;