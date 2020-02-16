const {Pit: {Upgrades, Perks, RenownUpgrades}} = require('../../frontEnd/src/pitMaster.json');
const {isTiered} = require('../apiTools');

/**
 * Represents a unlock renwon shop, perk, upgrade
 */
class UnlockEntry{
    /**
     * Cunstructs a Unlock Entry
     * @param {Object} raw 
     */
    constructor(raw){
        /**
         * raw unlock data
         * @type {Object}
         */
        this.raw;
        Object.defineProperty(this,'raw',{value:raw,enumerable:false});
        
        /**
         * Internal upgrade key name
         * @type {string}
         */
        this.key = raw.key;

        /**
         * signifies if the unlock is Upgrade, Perk, or RenownUpgrade
         * if its unkown then Unknown
         * @type {string}
         */
        this.type = 'Unknown';

        /**
         * Display name of the upgrade
         * @type {string}
         */
        this.displayName = this.key;

        /**
         * unix epoch (seconds) of unlock
         * @type {number}
         */
        this.timestamp = raw.acquireDate;

        /**
         * If the upgrade has multiple tiers this will be set
         * @type {number}
         */
        this.tier;

        if(Upgrades[this.key]){
            this.type = 'Upgrade';
            this.displayName = Upgrades[this.key].Name;
            this.tier = raw.tier;
        } else if(Perks[this.key]){
            this.type = 'Perk';
            this.displayName = Perks[this.key].Name;
        } else if(RenownUpgrades[this.key]){
            this.type = 'RenownUpgrade';
            this.displayName = RenownUpgrades[this.key].Name;
            if(isTiered(RenownUpgrades[this.key])) this.tier = raw.tier;
            this.cost = RenownUpgrades[this.key].Costs[raw.tier];
        }

        Object.defineProperty(this, 'type', {enumerable: false});

    }
} module.exports = UnlockEntry;