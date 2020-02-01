const {getRef} = require('../apiTools');
const pitMaster = require('../../pitMaster.json');
const {Levels, Prestiges} = pitMaster.Pit;

/**
 * Represents the player output from the Hypixel API
 */
class Pit{
    /**
     * Constructor for thr Pit class
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
     * Gets a specific value from the player's raw data
     * @param  {...string} path 
     * @returns {any}
     */
    getStat(...path){
        return getRef(this.raw,...path);
    }

    /**
     * Player's discord tag or undefined
     * @type {string}
     */
    get discord(){
        return this.getStat('socialMedia','links','DISCORD');
    }

    /**
     * Array of Player's Prestige Details  
     * @type {Array<Object>}
     */
    get prestiges(){
        return (this.getStat('stats','Pit','profile','prestiges')||[]);
    }

    /**
     * Player's Pit prestige
     * @type {number}
     */
    get prestige(){
        return this.prestiges.length;
    }

    /**
     * Player's display name
     * @type {string}
     */
    get name(){
        return this.getStat('displayname')||'Unkown';
    }

    /**
     * Player's uuid
     * @type {string}
     */
    get uuid(){
        return this.getStat('uuid')||'Unkown';
    }

    /**
     * Player's current xp
     * @type {number}
     */
    get xp(){
        return this.getStat('stats','Pit','profile','xp')||0;
    }

    /**
     * xp gained this prestige
     * @type {number}
     */
    get prestigeXp(){
        return this.xp-Prestiges[this.prestige-1].SumXp;
    }

    /**
     * Calculates Player level from xp and prestige
     * @param {number} prestige
     * @param {number} xp 
     * @returns {Object} {level: Player level, extra: xp progress into next level, next: xp required for next level}
     */
    static calcLevel(prestige, xp){
        if(this._level) return this._level;
        let multiplier = Prestiges[prestige].Multiplier;
        let level = 0;
        let extra = 0;
        let next = 0;
        while(xp>0){
            const levelXp = Levels[Math.floor(level/10)].Xp*multiplier;
            if(xp>=levelXp*10){
                xp-=levelXp*10;
                level+=10;
                if(xp==0) {
                    if(!level==120) extra=Levels[Math.floor(level/10)].Xp*multiplier;
                }
            }else{
                level+=Math.floor(xp/levelXp);
                /**
                 * Cached xp to next level, only set if previously cached
                 * @type {number}
                 */
                next = xp-levelXp*level%10;
                extra = xp;
                xp=0;
            }
        }
        return {level, extra, next};
    }

    /**
     * Integer level of the player
     * @type {number}
     */
    get level(){
        if(!this.levelCache) this.levelCache = this.calcLevel(this.prestige,this.xp);
        return this.levelCache.level
    }

    /**
     * Xp to level up
     * @type {number}
     */
    get xpToNextLevel(){
        if(!this.levelCache) this.levelCache = this.calcLevel(this.prestige,this.xp);
        return this.levelCache.next;
    }

    /**
     * Xp progress on the current level
     * @type {number}
     */
    get xpThisLevel(){
        if(!this.levelCache) this.levelCache = this.calcLevel(this.prestige,this.xp);
        return this.levelCache.extra;
    }

    /**
     * Current Gold
     * @type {number}
     */
    get currentGold(){
        return this.getStat('stats','Pit','profile','cash')||0;
    }

    /**
     * Current Bounty
     * @type {number}
     */
    get bounty(){
        const bumps = this.getStat('stats','Pit','profile','bounties')||[];
        return bumps.reduce((acc,bump)=>acc+bump.amount,0);
    }

    /**
     * Playtime in minutes
     * @type {number}
     */
    get playtime(){
        return this.getStat('stats','Pit','pit_stats_ptl','playtime_minutes');
    }

    /**
     * Times the player has opened the enderchest
     * @type {number}
     */
    get enderchestOpened(){
        return this.getStat('stats','Pit','pit_stats_ptl','enderchest_opened');
    }

    /**
     * Times the player has joined a instance of the pit
     * @type {number}
     */
    get joins(){
        return this.getStat('stats','Pit','pit_stats_ptl','joins');
    }

    /**
     * Total messages send in chat in pit
     * @type {number}
     */
    get chatMessages(){
        return this.getStat('stats','Pit','pit_stats_ptl','chat_messages');
    }

    /**
     * Times the player has left clicked in pit
     * @type {number}
     */
    get leftClicks(){
        return this.getStat('stats','Pit','pit_stats_ptl','left_clicks');
    }

    /**
     * Times the player has died in the pit
     * @type {number}
     */
    get deaths(){
        return this.getStat('stats','Pit','pit_stats_ptl','deaths');
    }

    /**
     * Total melee damage dealth by the player
     * @type {number}
     */
    get meleeDamageDealt(){
        return this.getStat('stats','Pit','pit_stats_ptl','melee_damage_dealt');
    }

    /**
     * Total sword hits
     * @type {number}
     */
    get swordHits(){
        return this.getStat('stats','Pit','pit_stats_ptl','sword_hits');
    }

    /**
     * Lifetime gold earned
     * @type {number}
     */
    get lifetimeGold(){
        return this.getStat('stats','Pit','pit_stats_ptl','cash_earned');
    }

    /**
     * Total arrows fired
     * @type {number}
     */
    get arrowsFired(){
        return this.getStat('stats','Pit','pit_stats_ptl','arrows_fired');
    }

    /**
     * Total bow damage dealth
     * @type {number}
     */
    get bowDamageDealt(){
        return this.getStat('stats','Pit','pit_stats_ptl','bow_damage_dealt');
    }

    /**
     * Total bow damage received
     * @type {number}
     */
    get bowDamageReceived(){
        return this.getStat('stats','Pit','pit_stats_ptl','bow_damage_received');
    }

    /**
     * Total kills
     * @type {number}
     */
    get kills(){
        return this.getStat('stats','Pit','pit_stats_ptl','kills');
    }

    /**
     * Total damage received
     * @type {number}
     */
    get damageReceived(){
        return this.getStat('stats','Pit','pit_stats_ptl','damage_received');
    }

    /**
     * Total jumps in the pit (center only)
     * @type {number}
     */
    get jumpsIntoPit(){
        return this.getStat('stats','Pit','pit_stats_ptl','jumped_into_pit');
    }

    /**
     * Total melee damage received
     * @type {number}
     */
    get meleeDamageReceived(){
        return this.getStat('stats','Pit','pit_stats_ptl','melee_damage_received');
    }

    /**
     * Total arrow hits
     * @type {number}
     */
    get arrowHits(){
        return this.getStat('stats','Pit','pit_stats_ptl','arrow_hits');
    }

    /**
     * Total damage dealt
     * @type {number}
     */
    get damageDealt(){
        return this.getStat('stats','Pit','pit_stats_ptl','damage_dealt');
    }

    /**
     * Total assists
     * @type {number}
     */
    get assists(){
        return this.getStat('stats','Pit','pit_stats_ptl','assists');
    }

    /**
     * Highest Streak
     * @type {number}
     */
    get highestStreak(){
        return this.getStat('stats','Pit','pit_stats_ptl','max_streak');
    }

    /**
     * Total blocks placed
     * @type {number}
     */
    get blocksPlaced(){
        return this.getStat('stats','Pit','pit_stats_ptl','blocks_placed');
    }

    /**
     * Total times launched by a launched
     * @type {number}
     */
    get launcherLaunches(){
        return this.getStat('stats','Pit','pit_stats_ptl','launched_by_launchers');
    }

    /**
     * Total diamond items purchased
     * @type {number}
     */
    get diamondItemsPurchased(){
        return this.getStat('stats','Pit','pit_stats_ptl','diamond_items_purchased');
    }

    /**
     * Total wheat farmed
     * @type {number}
     */
    get wheatFarmed(){
        return this.getStat('stats','Pit','pit_stats_ptl','wheat_farmed');
    }

    /**
     * Total sewer treasures found
     * @type {number}
     */
    get sewerTreasuresFound(){
        return this.getStat('stats','Pit','pit_stats_ptl','sewer_treasures_found');
    }

    /**
     * Total contracts completed
     * @type {number}
     */
    get contractsCompleted(){
        return this.getStat('stats','Pit','pit_stats_ptl','contracts_completed');
    }

    /**
     * Total contracts started
     * @type {number}
     */
    get contractsStarted(){
        return this.getStat('stats','Pit','pit_stats_ptl','contracts_started');
    }

    /**
     * Total night quests completed
     * @type {number}
     */
    get nightQuestsCompleted(){
        return this.getStat('stats','Pit','pit_stats_ptl','night_quests_completed');
    }

    /**
     * Total mystics encahnted of each tier
     * @type {Array<number>} [tier1, tier2, tier3]
     */
    get mysticsEnchanted(){
        return [
            this.getStat('stats','Pit','pit_stats_ptl','enchanted_tier1')||0,
            this.getStat('stats','Pit','pit_stats_ptl','enchanted_tier2')||0,
            this.getStat('stats','Pit','pit_stats_ptl','enchanted_tier3')||0
        ];
    }

    /**
     * Total dark pants created
     * @type {number}
     */
    get darkPantsCreated(){
        return this.getStat('stats','Pit','pit_stats_ptl','dark_pants_crated');
    }

    /**
     * Total lava buckets placed
     * @type {number}
     */
    get lavaBucketsPlaced(){
        return this.getStat('stats','Pit','pit_stats_ptl','lava_buckets_emptied');
    }

    /**
     * Total blocks broken
     * @type {number}
     */
    get blocksBroken(){
        return this.getStat('stats','Pit','pit_stats_ptl','blocks_broken');
    }

    /**
     * Total dark pants enchanted to t2
     * @type {number}
     */
    get darkPantsT2(){
        return this.getStat('stats','Pit','pit_stats_ptl','dark_pants_t2');
    }

    /**
     * Total golden heads eaten
     * @type {number}
     */
    get gheadsEaten(){
        return this.getStat('stats','Pit','pit_stats_ptl','gheads_eaten');
    }

    /**
     * Total hidden jewels triggered
     * @type {number}
     */
    get hiddenJewelsTriggered(){
        return this.getStat('stats','Pit','pit_stats_ptl','hidden_jewel_triggers');
    }

    /**
     * Total golden apples eaten
     * @type {number}
     */
    get gapplesEaten(){
        return this.getStat('stats','Pit','pit_stats_ptl','gapples_eaten');
    }

    /**
     * Total soups drank
     * @type {number}
     */
    get soupsDrank(){
        return this.getStat('stats','Pit','pit_stats_ptl','soups_drank');
    }

    /**
     * Total gold earned from farming (sold to npc)
     * @type {number}
     */
    get goldFromFarming(){
        return this.getStat('stats','Pit','pit_stats_ptl','gold_from_farming');
    }

    /**
     * Total gold earned from selling fish
     * @type {number}
     */
    get foldFromSellingFish(){
        return this.getStat('stats','Pit','pit_stats_ptl','gold_from_selling_fish');
    }

    /**
     * Times the player has cast a fishing rod
     * @type {number}
     */
    get fishingRodCasts(){
        return this.getStat('stats','Pit','pit_stats_ptl','fishing_rod_launched');
    }

    /**
     * Total fish fised
     * @type {number}
     */
    get fishedFish(){
        return this.getStat('stats','Pit','pit_stats_ptl','fishes_fished');
    }

    /**
     * Total times catching anything from fishing
     * @type {number}
     */
    get fishedAnything(){
        return this.getStat('stats','Pit','pit_stats_ptl','fished_anything');
    }

    /**
     * Times the player has completed kinqs quest
     * @type {number}
     */
    get kingsQuestCompletions(){
        return this.getStat('stats','Pit','pit_stats_ptl','king_quest_completion');
    }
} module.exports = Pit;

/**
 * Formats big numbers nicely
 * @param {*} number 
 * @param {*} decPlaces 
 * @returns {string} ex (10345678,2) => '10.34m'
 */
function abbrNum(number, decPlaces) { //https://stackoverflow.com/questions/2685911/is-there-a-way-to-round-numbers-into-a-reader-friendly-format-e-g-1-1k
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}