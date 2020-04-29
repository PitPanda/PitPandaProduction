const { Pit: { Upgrades, Killstreaks, Perks, RenownUpgrades } } = require('../frontEnd/src/pitMaster.json');
const { isTiered } = require('../apiTools/apiTools');

/**
 * Represents a unlock renwon shop, perk, upgrade
 */
class UnlockEntry {
    /**
     * Cunstructs a Unlock Entry
     * @param {Object} raw 
     */
    constructor(raw) {
        /**
         * raw unlock data
         * @type {Object}
         */
        this.raw;
        Object.defineProperty(this, 'raw', { value: raw, enumerable: false });

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

        /**
         * renown cost for renown upgrades only
         * @type {number}
         */
        this.cost;

        if (Upgrades[this.key]) {
            this.type = 'Upgrade';
            this.displayName = Upgrades[this.key].Name;
            this.tier = raw.tier;
        } else if (Perks[this.key]) {
            this.type = 'Perk';
            this.displayName = Perks[this.key].Name;
        } else if (Killstreaks[this.key]) {
            this.type = 'Killstreak';
            this.displayName = Killstreaks[this.key].Name;
        } else if (RenownUpgrades[this.key]) {
            this.type = 'Renown';
            this.displayName = RenownUpgrades[this.key].Name;
            if (isTiered(RenownUpgrades[this.key])) this.tier = raw.tier;
            Object.defineProperty(this, 'cost', {
                enumerable: false,
                value: RenownUpgrades[this.key].Costs[raw.tier]
            });
        }
    }
} module.exports = UnlockEntry;