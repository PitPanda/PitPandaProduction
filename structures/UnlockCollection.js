const UnlockEntry = require('./UnlockEntry');
const Item = require('./Item');
const { Pit: { Upgrades, RenownUpgrades, Perks } } = require('../frontEnd/src/pitMaster.json');
const { getRef, isTiered, subDescription } = require('../apiTools/apiTools');

const textHelpers = require('../utils/TextHelpers');

/**
 * represents a set of unlocks
 * can be used for shop unlocks during a prestige or renown shop unlocks
 */
class UnlockCollection {
    /**
     * Constructs UnlockCollection
     * @param {Object} data Accepts UnlockEntry[] or raw array info of unlocks
     * @param {object} raw raw api output
     */
    constructor(data = [], raw) {
        /**
         * Unlocks contained with the set
         * @type {UnlockEntry[]}
         */
        this.raw;
        Object.defineProperty(this, 'raw', {
            value: data.map(entry =>
                (!(entry instanceof UnlockEntry)) ? new UnlockEntry(entry) : entry
            ), enumerable: false
        });

        /**
         * hypixel api output
         * @type {object}
         */
        this.api;
        Object.defineProperty(this, 'api', { value: raw, enumerable: false });

        this.buildItem = this.buildItem.bind(this);
    }

    /**
     * Checks if the collection contains an upgrade
     * @param {string} key 
     * @returns {boolean};
     */
    has = (key) => this.raw.some(unlock => unlock.key == key);

    /**
     * returns the tier of an upgrade (indexed from 1)
     * @param {string} key 
     * @returns {number}
     */
    tierOf = (key) => this.raw.filter(unlock => unlock.key == key).length;

    /**
     * Builds item to display for that key
     * @param {string} key
     * @returns {Item}
     */
    buildItem(key) {
        const tier = this.tierOf(key);
        const up = subDescription(Upgrades[key] || RenownUpgrades[key], tier - 1, this.api);
        const name = `${tier > 0 ? '§9' : '§c'}${up.Name} ${isTiered(key) ? textHelpers.romanNumGen(tier) : ''}`;
        return new Item(name, up.Description, up.Item.Id, up.Item.Meta, tier);
    }
}

module.exports = UnlockCollection;

