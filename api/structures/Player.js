const {getRef} = require('../apiTools');

/**
 * Represents the player output from the Hypixel API
 */
class Player{
    /**
     * Constructor for thr Player class
     * @param {Object} json 
     */
    constructor(json){
        /**
         * Represents whether or not the player is defined
         * @type {Boolean}
         */
        this.valid = json.success;

        /**
         * Raw hypixel output json
         * @type {Object}
         */
        this.raw = json.player;
    }

    /**
     * Player's discord tag
     * @type {string}
     */
    get discord(){
        return getRef(this.raw,'socialMedia','links','DISCORD');
    }

    /**
     * Array of Player's Prestige Details  
     * @type {Array<Object>}
     */
    get prestiges(){
        return getRef(this.raw,'stats','Pit','profile','prestiges');
    }

    /**
     * Player's Pit prestige
     * @type {number}
     */
    get prestige(){
        return (this.prestiges||[]).length;
    }

    /**
     * Player's display name
     * @type {string}
     */
    get name(){
        return getRef(this.raw,'displayname');
    }
} module.exports = Player;