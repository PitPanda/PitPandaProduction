const redis = require('redis');

class RedisClient {
    constructor(db) {
        this.client = redis.createClient(process.env.REDIS_URL || {
            host: 'localhost',
            port: process.env.REDIS_PORT || 6381,
            db
        });
    }

    set(setName, key, value) {
        const promise = new Promise((resolve, reject) => {
            this.client.zadd(setName, value, key.toString(), (err, res) => {
                if (err) return reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    delete(setName, key){
        const promise = new Promise((resolve, reject) => {
            this.client.zrem(setName, key, (err, res) => {
                if (err) return reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    get(setName, key) {
        const promise = new Promise((resolve, reject) => {
            this.client.zscore(setName, key, (err, res) => {
                if (err) return reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    getRank(setName, key) {
        const promise = new Promise((resolve, reject) => {
            this.client.zrevrank(setName, key, (err, res) => {
                if (err) return reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    ping() {
        const promise = new Promise((resolve, reject) => {
            const requestSent = Date.now();
            this.client.ping((res) => {
                const result = Date.now() - requestSent;

                resolve(result);
            });
        });

        return promise;
    }

    getRange(setName, topPos, bottomPos) {
        const promise = new Promise((resolve, reject) => {
            this.client.zrevrange(setName, topPos, bottomPos-1, "WITHSCORES", (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });

        return promise; 
    }
}

module.exports = RedisClient;