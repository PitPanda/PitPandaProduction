const pitMaster = require('../../pitMaster.json');
const UnlockEntry = require('./UnlockEntry');

/**
 * Represents a pit prestige
 */
class Prestige{
    raw_unlocks;
    _unlocks;
    /**
     * Constructs a Prestige
     * @param {number} prestige 
     * @param {number} time
     * @param {Object[]} unlocks 
     * @param {number} gold 
     */
    constructor(prestige,time,unlocks,gold){
        /**
         * The prestige someone was at before prestiging
         * @type {number}
         */
        this.prestige;
        Object.defineProperty(this,'prestige',{value:prestige,enumerable:false});

        /**
         * Unix epoch timestamp (seconds) for the completion of the prestige
         * if its their current prestige this with not be set
         * @type {number}
         */
        this.timestamp=time;

        if(gold) gold = Math.round(gold);
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
        Object.defineProperty(this,'raw_unlocks',{value:unlocks,enumerable:false});

        /**
         * Cached Unlocks Array
         * @type {UnlockEntry[]}
         */
        this._unlocks;
        Object.defineProperty(this,'_unlocks',{enumerable:false});

        /**
         * processed array of unlocks
         * @type {UnlockEntry[]}
         */
        this.unlocks;
        Object.defineProperty(this,'unlocks',{
            enumerable:true,
            get(){
                if (!this._unlocks) this._unlocks = (this.raw_unlocks||[]).map(entry=>new UnlockEntry(entry));
                return this._unlocks;
            }
        });
    }
} module.exports = Prestige;