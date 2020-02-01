const {getRef,romanNumGen,toHex} = require('../apiTools');
const mcitems = require('../../minecraftItems.json');
const mcenchants = require('../../enchants.json');
const {Extra:{ColorCodes}} = require('../../pitMaster.json');

/**
 * Represents a minecraft item
 */
class Item{
    /**
     * Constructs from the decoded nbt data 
     * @param {Object} item 
     */
    constructor(item){
        /**
         * minecraft item id
         * @type {number}
         */
        this.id = getRef(item,'id','value');
        if(!this.id) return {}; //air slots should be empty objects
        /**
         * minecraft item meta OR leather color
         * can be type number or string
         */
        this.meta = getRef(item,'Damage','value') || toHex(getRef(item, "tag", "value","display","value","color","value"));
        if(this.id>=298&&this.id<=301&&typeof this.meta == 'undefined') this.meta = 'A06540';
        /**
         * Item's custom name if it has one or its minecraft default name
         * @type {string}
         */
        this.name = 
            getRef(item,'tag','value','display','value','Name','value') ||
            getItemNameFromId(this.id,this.meta);

        /**
         * Item lore
         * @type {string[]}
         */
        this.lore = 
            (getRef(item, "tag","value","display","value","Lore","value","value")||[])
            .concat((getRef(item, "tag", "value", "ench", "value", "value")||[])
            .map(getEnchantDescription));

        /**
         * Item stack size
         * @type {number}
         */
        this.count = getRef(item,"Count","value");
    }
} module.exports = Item;

/**
 * takes item id and meta and returns it item name
 * @param {number} id 
 * @param {number} meta 
 * @returns {string}
 */
function getItemNameFromId(id,meta){
    const firstcheck = mcitems.filter(item=>item.type==id);
    if(firstcheck.length==0) return;
    const secondcheck = firstcheck.find(item=>item.meta==meta);
    return (secondcheck||firstcheck[0]).name;
}

/**
 * Takes unformatted nbt data for enchant and formats a stirng
 * @param {Object} ench 
 * @returns {string}
 */
function getEnchantDescription(ench){
    const info = minecraftEnchants.find(el=>el.id==ench.id.value);
    if(!info) return '';
    return `${ColorCodes.GRAY}${info.displayName} ${romanNumGen(ench.lvl.value)}`;
}

/*
let lore = (getRef(item, "tag","value","display","value","Lore","value","value")||[])
    .concat((getRef(item, "tag", "value", "ench", "value", "value")||[])
    .map(ench=>
        `${Colors.GRAY}
        ${minecraftEnchants.find(el=>el.id==ench.id.value).displayName} 
        ${romanNumGen(ench.lvl.value)}`
    ));
*/