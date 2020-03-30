const { Extra: { ColorCodes } } = require('../frontEnd/src/pitMaster.json');
const mcenchants = require('../enchants.json');
const mcitems = require('../minecraftItems.json');

const textHelpers = require('../utils/TextHelpers');

/**
 * Represents a minecraft item
 */
class Item {

    /**
     * Constructs an Item
     * @param {string} name 
     * @param {string[]} lore 
     * @param {number} id 
     * @param {number|string} meta 
     * @param {number} count 
     * @returns {Item}
     */
    constructor(name = '', desc = [], id = 0, meta = 0, count = 1) {
        /**
         * Item's custom name if it has one or its minecraft default name
         * @type {string}
         */
        this.name = name;
        /**
         * minecraft item id
         * @type {number}
         */
        this.id = id;
        /**
         * Item lore/description
         * @type {string[]}
         */
        this.desc = desc;
        /**
         * minecraft item meta OR leather color
         * @type {(number|string)}
         */
        this.meta = meta;
        /**
         * Item stack size
         * @type {number}
         */
        this.count = count;
    }

    /**
     * Constructs from the decoded nbt data 
     * @param {Object} item 
     */
    static buildFromNBT(item) {
        const getRef = (object, ...path) => {
            if (!object) return undefined;
            if (path.length == 1) return object[path[0]];
            else return getRef(object[path.shift()], ...path)
        }

        const getItemNameFromId = (id, meta) => {
            const firstcheck = mcitems.filter(item => item.type == id);
            if (firstcheck.length == 0) return;
            const secondcheck = firstcheck.find(item => item.meta == meta);
            return (secondcheck || firstcheck[0]).name;
        }

        const id = getRef(item, 'id', 'value');
        if (!id) return {}; //air slots should be empty objects

        let meta = getRef(item, 'Damage', 'value') || textHelpers.toHex(getRef(item, "tag", "value", "display", "value", "color", "value"));
        if (id >= 298 && id <= 301 && typeof meta == 'undefined') meta = 'A06540';

        const name =
            getRef(item, 'tag', 'value', 'display', 'value', 'Name', 'value') ||
            getItemNameFromId(id, meta);

        let lore =
            (getRef(item, "tag", "value", "display", "value", "Lore", "value", "value") || [])
                .concat(
                    (getRef(item, "tag", "value", "ench", "value", "value") || [])
                        .map(getEnchantDescription)
                );
        if (id === 288 && !lore.length) lore = [
            `${ColorCodes.DARK_RED}WARNING!`,
            `${ColorCodes.GRAY}This is NOT a ${ColorCodes.DARK_AQUA}Funky Feather${ColorCodes.GRAY}.`
        ];

        const count = getRef(item, "Count", "value");

        return new Item(name, lore, id, meta, count);
    }
} module.exports = Item;

/**
 * Takes unformatted nbt data for enchant and formats a stirng
 * @param {Object} ench 
 * @returns {string}
 */
function getEnchantDescription(ench) {
    const info = mcenchants.find(el => el.id == ench.id.value);
    if (!info) return '';
    return `${ColorCodes.GRAY}${info.displayName} ${textHelpers.romanNumGen(ench.lvl.value)}`;
}