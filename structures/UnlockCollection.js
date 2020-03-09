const UnlockEntry = require('./UnlockEntry');
const Item = require('./Item');
const {Pit: {Upgrades, RenownUpgrades, Perks}} = require('../frontEnd/src/pitMaster.json');
const {getRef, toHex, romanNumGen, isTiered} = require('../apiTools/apiTools');

/**
 * represents a set of unlocks
 * can be used for shop unlocks during a prestige or renown shop unlocks
 */
class UnlockCollection{
    /**
     * Constructs UnlockCollection
     * @param {Object} data Accepts UnlockEntry[] or raw array info of unlocks
     * @param {object} raw raw api output
     */
    constructor(data=[], raw){
        /**
         * Unlocks contained with the set
         * @type {UnlockEntry[]}
         */
        this.raw;
        Object.defineProperty(this,'raw',{value:data.map(entry=>
            (!(entry instanceof UnlockEntry))?new UnlockEntry(entry):entry
        ),enumerable:false});

        /**
         * hypixel api output
         * @type {object}
         */
        this.api;
        Object.defineProperty(this,'api',{value:raw,enumerable:false});
    }

    /**
     * Checks if the collection contains an upgrade
     * @param {string} key 
     * @returns {boolean};
     */
    has = (key) => this.raw.some(unlock=>unlock.key==key);

    /**
     * returns the tier of an upgrade (indexed from 1)
     * @param {string} key 
     * @returns {number}
     */
    tierOf = (key) => this.raw.filter(unlock=>unlock.key==key).length;

    /**
     * Builds item to display for that key
     * @param {string} key
     * @returns {Item}
     */
    buildItem = (key) => {
        const tier = this.tierOf(key);
        const up = subDescription(Upgrades[key] || RenownUpgrades[key],tier-1,this.api);
        const name = `${tier>0?'§9':'§c'}${up.Name} ${isTiered(key)?romanNumGen(tier):''}`;
        return new Item(name,up.Description,up.Item.Id,up.Item.Meta,tier);
    }

    /*
            
            renownups.push(
                createItem(
                    `
                        ${(tier<0)?"§c":"§9"}
                        ${upgrade.Name} 
                        ${
                            (
                                (upgrade.Levels||[]).length>1||
                                upgrade.Extra.Formatting=="Seperated"||
                                upgrade.Extra.Formatting=="Reveal"
                            )?romanNumGen(tier+1):''
                        }
                    `,
                    upgrade.Description,
                    upgrade.Item.Id,
                    upgrade.Item.Meta,
                    tier+1
                )
            );
                       
            */
}

/**
 * 
 * @param {object} upgrade pitMaster upgrade data
 * @param {number} tier 
 * @param {object} api raw output
 */
function subDescription(upgrade,tier,api){
    upgrade = JSON.parse(JSON.stringify(upgrade));
    const format = getRef(upgrade,'Extra','Formatting');
    if(format=="Reveal"){
        if(tier<0)tier=0;
        upgrade.Description = upgrade.Description.slice(0,1+tier+upgrade.Extra.IgnoreIndex);
    }else if(format=="Seperated"){
        if(tier<0)tier=0;
        upgrade.Description = upgrade.Description[tier];
    }else if(format=="ApiReference"){
        if(tier<0)tier=0;
        let data = getRef(api,...upgrade.Extra.Ref.slice(1));
        if(upgrade.Extra.Function=='toHex') data = toHex(data);
        upgrade.Description = upgrade.Description.map(line=>line.replace('$',data));
        upgrade.Item.Meta = upgrade.Item.Meta.replace('$',data);
    }else{
        upgrade.Description = upgrade.Description.map(line=>line.replace('$',(tier<0)?0:upgrade.Levels[tier]));
    }
    return upgrade;
}

module.exports = UnlockCollection;