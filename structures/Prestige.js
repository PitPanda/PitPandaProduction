const pitMaster = require('../frontEnd/src/pitMaster.json');
const UnlockCollection = require('./UnlockCollection');
const UnlockEntry = require('./UnlockEntry');

/**
 * Represents a pit prestige
 */
class Prestige {
    /**
     * Constructs a Prestige
     * @param {number} prestige 
     * @param {number} time
     * @param {Object[]} unlocks 
     * @param {number} gold 
     * @param {Object[]} renownunlocks
     */
    constructor(prestige, time, unlocks = [], gold = 0, renownunlocks = []) {
        /**
         * The prestige someone was at before prestiging
         * @type {number}
         */
        this.prestige;
        Object.defineProperty(this, 'prestige', { value: prestige, enumerable: false });

        /**
         * Unix epoch timestamp (seconds) for the completion of the prestige
         * if its their current prestige this with not be set
         * @type {number}
         */
        this.timestamp = time;

        if (gold) gold = Math.round(gold);
        /**
         * Gold the player earned during this prestige
         * May not be set
         * @type {number}
         */
        this.gold = gold;

        /**
         * Raw Array of the unlocks this prestige
         * @type {Object[]}
         */
        this.raw_unlocks;
        Object.defineProperty(this, 'raw_unlocks', {
            value: unlocks.concat(renownunlocks).sort((a, b) => a.acquireDate < b.acquireDate ? -1 : 1),
            enumerable: false
        });

        /**
         * processed array of unlocks
         * @type {UnlockEntry[]}
         */
        this.unlocks;
        Object.defineProperty(this, 'unlocks', {
            enumerable: true,
            get: () => this.unlocksCollection.raw
        });
    }

    /**
     * Unlock Collection formatted unlocks
     * @type {UnlockCollection}
     */
    get unlocksCollection() {
        if (!this._unlocks) {
            /**
             * Cached Unlocks Array
             * @type {UnlockEntry[]}
             */
            this._unlocks;
            Object.defineProperty(this, '_unlocks', { enumerable: false, value: new UnlockCollection(this.raw_unlocks || []) });
        }
        return this._unlocks;
    }
} module.exports = Prestige;