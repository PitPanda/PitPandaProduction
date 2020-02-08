const {Pit: {RenownUpgrades}} = require('../../pitMaster.json');
const UnlockEntry = require('./UnlockEntry');
/**
 * Represents the Renown Shop
 */
class RenownShop{
    /**
     * Constructs from array of renown shop unlocks
     * @param {UnlocksEntry[]} unlocks 
     * @param {?Object} [raw=undefined] api output
     */
    constructor(unlocks, raw){
        /**
         * unlocks array
         * @type {UnlocksEntry[]}
         */
        this.unlocks;
        Object.defineProperty(this,'unlocks',{
            enumerable:false,
            value: unlocks
        });

        /**
         * Clone of raw api output
         * @type {Object}
         */
        this.raw;
        Object.defineProperty(this,'raw',{
            enumerable:false,
            value: raw
        });

        for(const key of RenownUpgrades){
            Object.defineProperty(this,key,{
                enumerable:true,
                get(){
                    const tier = this.unlocks.filter(entry=>entry.key===key).length;
                    const cost = RenownUpgrades[key].Costs[tier+1];
                }
            })
        }
    }

} module.exports = RenownShop;