const {getRef,romanNumGen,toHex,getItemNameFromId} = require('../apiTools/apiTools');
const mcenchants = require('../enchants.json');


/**
 * Represents a minecraft item
 */
class SimpleItem{
    
    /**
     * 
     * @param {String} name 
     * @param {number} id 
     * @param {number|String} meta 
     * @param {number} count 
     * @param {any} rest
     * @returns {SimpleItem}
     */
    constructor(name='',id=0,meta=0,count=1, rest={}){
        /**
         * Item's custom name if it has one or its minecraft default name
         * @type {string}
         */
        this.name=name;
        /**
         * minecraft item id
         * @type {number}
         */
        this.id=id;
        /**
         * minecraft item meta OR leather color
         * @type {(number|string)}
         */
        this.meta=meta;
        /**
         * Item stack size
         * @type {number}
         */
        this.count=count;
        /**
         * Item nonce
         * @type {number}
         */
        this.nonce=rest.nonce;
        /**
         * Vanilla enchants
         * @type {any[]}
         */
        this.vanillaEnchants=rest.vanillaEnchants;
        /**
         * Mystic enchants
         * @type {any[]}
         */
        this.mysticEnchants=rest.mysticEnchants;
    }

    /**
     * Constructs from the decoded nbt data 
     * @param {Object} item 
     */
    static buildFromNBT(item){
        const id = getRef(item,'id','value');
        if(!id) return {}; //air slots should be empty objects
        
        let meta = getRef(item,'Damage','value') || toHex(getRef(item, "tag", "value","display","value","color","value"));
        if(id>=298&&id<=301&&typeof meta == 'undefined') meta = 'A06540';
        
        const name = 
            getRef(item,'tag','value','display','value','Name','value') ||
            getItemNameFromId(id,meta);
        
        const count = getRef(item,"Count","value");

        let optionals = {};
        if(getRef(item,'tag','value','ExtraAttributes')){
            optionals.nonce =  getRef(item,'tag','value','ExtraAttributes','value','Nonce','value');
            let mysticEnchants = getRef(item,'tag','value','ExtraAttributes','value','CustomEnchants','value','value');
            if(mysticEnchants) optionals.mysticEnchants = mysticEnchants.map(ench=>({key:ench.Key.value,tier:ench.Level.value}));
        }
        let vanillaEnchants = getRef(item, "tag", "value", "ench", "value", "value");
        if(vanillaEnchants&&vanillaEnchants.length) optionals.vanillaEnchants = vanillaEnchants.map(enchantFormat);
        return new SimpleItem(name,id,meta,count,optionals);
    }
} module.exports = SimpleItem;

/**
 * Takes unformatted nbt data for enchant and formats a stirng
 * @param {Object} ench 
 * @returns {Object}
 */
function enchantFormat(ench){
    const info = mcenchants.find(el=>el.id==ench.id.value);
    if(!info) return {key:'unknown',tier:0};
    return {key:info.displayName,tier:ench.lvl.value};
}