const {getRef} = require('../apiTools');
const {Pit: {Levels, Prestiges}, Extra: {ColorCodes,RankPrefixes}} = require('../../pitMaster.json');
const Item = require('./Item');
const Prestige = require('./Prestige');
const UnlockEntry = require('./UnlockEntry');
const RenownShop = require('./RenownShop');
const {inflate} = require('pako');
const nbt = require('nbt');

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
        this.valid;
        Object.defineProperty(this,'valid',{value:json.success,enumerable:false});

        /**
         * Raw hypixel output json
         * @type {Object}
         */
        this.raw;
        Object.defineProperty(this,'raw',{value:json.player,enumerable:false});

        /**
         * User's linked discord account
         * @type {string}
         */
        this.discord;
        Object.defineProperty(this,'discord',{
            enumerable:true,
            get: ()=>this.getStat('socialMedia','links','DISCORD')
        });

        /**
         * Array of Player's Prestige Details
         * @type {Prestige[]}
         */
        this.prestiges;
        Object.defineProperty(this,'prestiges',{
            enumerable:true,
            get: ()=>{
                if(!this._prestiges)Object.defineProperty(this,'_prestiges',{
                        enumerable: false,
                        value: (this.getStat('stats','Pit','profile','prestiges')||[]).map(pres=>{
                        let unlocks = this.getStat('stats','Pit','profile',`unlocks_${pres.index-1}`)
                        if(pres.index==1) unlocks = this.getStat('stats','Pit','profile','unlocks');
                        return new Prestige(
                            pres.index-1,
                            pres.timestamp,
                            unlocks,
                            this.getStat('stats','Pit','profile',`cash_during_prestige_${pres.index-1}`)
                        );
                    }).concat(
                        [new Prestige(
                            this.prestige,
                            undefined,
                            this.getStat('stats','Pit','profile',(this.prestige!=0)?`unlocks_${this.prestige}`:'unlocks'),
                            this.getStat('stats','Pit','profile',`cash_during_prestige_${this.prestige}`)
                        )]
                    )
                });
                return this._prestiges;
            }
        });

        /**
         * Player's Pit prestige
         * @type {number}
         */
        this.prestige;
        Object.defineProperty(this,'prestige',{
            enumerable:true,
            get: ()=>(this.getStat('stats','Pit','profile','prestiges')||[]).length
        });

        /**
         * Player's display name
         * @type {string}
         */
        this.name;
        Object.defineProperty(this,'name',{
            enumerable:true,
            get: ()=>this.getStat('displayname')||'Unknown'
        });

        /**
         * Player's uuid
         * @type {string}
         */
        this.uuid;
        Object.defineProperty(this,'uuid',{
            enumerable:true,
            get: ()=>this.getStat('uuid')||'Unknown'
        });

        /**
         * Player's server rank
         * @type {string}
         */
        this.rank;
        Object.defineProperty(this,'rank',{
            enumerable:true,
            get: ()=>{
                let rank = this.getStat('newPackageRank') || this.getStat('PackageRank') || 'NON';
                if(this.getStat('monthlyPackageRank') =='SUPERSTAR') rank = 'SUEPRSTAR';
                const staff = this.getStat('rank');
                if(staff && staff!='NORMAL') rank = this.getStat('rank');
                return rank;
            }
        });

        /**
         * Player's ingame color formatted name
         * @type {string}
         */
        this.formattedName;
        Object.defineProperty(this,'formattedName',{
            enumerable:true,
            get: ()=>{
                const rank = this.rank;
                let prefix = this.getStat('prefix') || RankPrefixes[rank] || '§7';
                const plus = this.getStat('rankPlusColor');
                prefix = prefix.replace('$',ColorCodes[plus]||'§c');
                return prefix + (rank!='NON'?' ':'') + this.name;
            }
        });

        /**
         * Player is online
         * @type {boolean}
         */
        this.online;
        Object.defineProperty(this,'online',{
            enumerable:true,
            get: ()=>{
                const login = this.getStat('lastLogin');
                const logout = this.getStat('lastLogout');
                if(!login||!logout) return false;
                return login > logout;
            }
        });

        /**
         * unix epock timestamp (seconds) of the last time their pit profile was saved
         * @type {number}
         */
        this.lastSave = this.getStat('stats','Pit','profile','last_save');

        /**
         * Player's current xp
         * @type {number}
         */
        this.xp;
        Object.defineProperty(this,'xp',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','profile','xp')||0
        });

        /**
         * xp gained this prestige
         * @type {number}
         */
        this.prestigeXp;
        Object.defineProperty(this,'prestigeXp',{
            enumerable:true,
            get: ()=>(this.prestige>0)?this.xp-Prestiges[this.prestige-1].SumXp:this.xp
        });

        /**
         * xp required to reach next prestige
         * @type {number}
         */
        this.prestigeXpGoal;
        Object.defineProperty(this,'prestigeXpGoal',{
            enumerable:true,
            get: ()=>Prestiges[this.prestige].TotalXp
        });

        /**
         * Integer level of the player
         * @type {number}
         */
        this.level;
        Object.defineProperty(this,'level',{
            enumerable:true,
            get(){
                if(!this.levelCache) this.loadLevelCache();
                return this.levelCache.level
            }
        });

        /**
         * Xp to level up
         * @type {number}
         */
        this.xpToNextLevel;
        Object.defineProperty(this,'xpToNextLevel',{
            enumerable:true,
            get(){
                if(!this.levelCache) this.loadLevelCache();
                return this.levelCache.next || undefined;
            }
        });

        /**
         * Xp progress on the current level
         * @type {number}
         */
        this.xpThisLevel;
        Object.defineProperty(this,'xpThisLevel',{
            enumerable:true,
            get(){
                if(!this.levelCache) this.loadLevelCache();
                return this.levelCache.extra || undefined;
            }
        });

        /**
         * Current Gold
         * @type {number}
         */
        this.currentGold;
        Object.defineProperty(this,'currentGold',{
            enumerable:true,
            get: ()=>Math.round(100*(this.getStat('stats','Pit','profile','cash')||0))/100
        });

        /**
         * Prestige Gold
         * @type {number}
         */
        this.prestigeGold;
        Object.defineProperty(this,'prestigeGold',{
            enumerable:true,
            get: ()=>this.prestiges[this.prestige].gold
        });

        /**
         * Prestige Gold Goal
         * @type {number}
         */
        this.prestigeGoldGoal;
        Object.defineProperty(this,'prestigeGoldGoal',{
            enumerable:true,
            get: ()=>Prestiges[this.prestige].GoldReq
        });

        /**
         * Renown unlocks
         * @type {RenownShop}
         */
        this.renownShop;
        Object.defineProperty(this,'renownShop',{
            enumerable:true,
            get: ()=>{
                if(!this._renownShop) Object.defineProperty(this,'_renownShop',{
                    enumerable: false,
                    value: new RenownShop((this.getStat('stats','Pit','profile','renown_unlocks')||[])
                    .map(entry => new UnlockEntry(entry)))
                });
                return this._renownShop;
            }
        });

        /**
         * Equiped Perks
         * @type {string[]}
         */
        this.perks;
        Object.defineProperty(this,'perks',{
            enumerable:true,
            get: ()=>{
                let arr = new Array(this.perkSlots).fill('none');
                for(let i = 0; i < this.perkSlots; i++)
                    arr[i] = this.getStat('stats','Pit','profile',`selected_perk_${i}`) || arr[i];
                return arr;
            }
        });

        /**
         * Available Perk Slots
         * @type {number}
         */
        this.perkSlots = (this.renownShop.find(({key})=>key=='extra_perk_slot'))?4:3;

        /**
         * Current Renown
         * @type {number}
         */
        this.renown;
        Object.defineProperty(this,'renown',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','profile','renown')
        });

        /**
         * Total Renown earned
         * @type {number}
         */
        this.lifetimeRenown;
        Object.defineProperty(this,'lifetimeRenown',{
            enumerable:true,
            get: ()=>{
                if(!this._lifetimeRenown) Object.defineProperty(this,'_lifetimeRenown',{
                    enumerable: false,
                    value: (this.renownShopSpent||0)+(this.renown||0)+2*(this.darkPantsCreated||0)
                });
                return this._lifetimeRenown;
            }
        });

        /**
         * Total renown spent in the shop
         * @type {number}
         */
        this.renownShopSpent;
        Object.defineProperty(this,'renownShopSpent',{
            enumerable:true,
            get: ()=>{
                if(!this._renownShopSpent) Object.defineProperty(this,'_renownShopSpent',{
                    enumerable: false,
                    value: this.renownShop.reduce((acc,entry)=>acc+entry.cost,0)
                });
                return this._renownShopSpent;
            }
        });

        /**
         * Current Bounty
         * @type {number}
         */
        this.bounty;
        Object.defineProperty(this,'bounty',{
            enumerable:true,
            get:()=>(this.getStat('stats','Pit','profile','bounties')||[])
                .reduce((acc,bump)=>acc+bump.amount,0)||undefined
        });

        /**
         * Playtime in minutes
         * @type {number}
         */
        this.playtime;
        Object.defineProperty(this,'playtime',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','playtime_minutes')
        });

        /**
         * Times the player has opened the enderchest
         * @type {number}
         */
        this.enderchestOpened;
        Object.defineProperty(this,'enderchestOpened',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','enderchest_opened')
        });

        /**
         * Times the player has joined a instance of the pit
         * @type {number}
         */
        this.joins;
        Object.defineProperty(this,'joins',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','joins')
        });

        /**
         * Total messages send in chat in pit
         * @type {number}
         */
        this.chatMessages;
        Object.defineProperty(this,'chatMessages',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','chat_messages')
        });

        /**
         * Times the player has left clicked in pit
         * @type {number}
         */
        this.leftClicks;
        Object.defineProperty(this,'leftClicks',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','left_clicks')
        });

        /**
         * Times the player has died in the pit
         * @type {number}
         */
        this.deaths;
        Object.defineProperty(this,'deaths',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','deaths')
        });

        /**
         * Total melee damage dealth by the player
         * @type {number}
         */
        this.meleeDamageDealt;
        Object.defineProperty(this,'meleeDamageDealt',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','melee_damage_dealt')
        });

        /**
         * Total sword hits
         * @type {number}
         */
        this.swordHits;
        Object.defineProperty(this,'swordHits',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','sword_hits')
        });

        /**
         * Lifetime gold earned
         * @type {number}
         */
        this.lifetimeGold;
        Object.defineProperty(this,'lifetimeGold',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','cash_earned')
        });

        /**
         * Total arrows fired
         * @type {number}
         */
        this.arrowsFired;
        Object.defineProperty(this,'arrowsFired',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','arrows_fired')
        });

        /**
         * Total bow damage dealth
         * @type {number}
         */
        this.bowDamageDealt;
        Object.defineProperty(this,'bowDamageDealt',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','bow_damage_dealt')
        });


        /**
         * Total bow damage received
         * @type {number}
         */
        this.bowDamageReceived;
        Object.defineProperty(this,'bowDamageReceived',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','bow_damage_received')
        });


        /**
         * Total damage received
         * @type {number}
         */
        this.damageReceived;
        Object.defineProperty(this,'damageReceived',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','damage_received')
        });


        /**
         * Total jumps in the pit (center only)
         * @type {number}
         */
        this.jumpsIntoPit;
        Object.defineProperty(this,'jumpsIntoPit',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','jumped_into_pit')
        });


        /**
         * Total melee damage received
         * @type {number}
         */
        this.meleeDamageReceived;
        Object.defineProperty(this,'meleeDamageReceived',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','melee_damage_received')
        });


        /**
         * Total arrow hits
         * @type {number}
         */
        this.arrowHits;
        Object.defineProperty(this,'arrowHits',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','arrow_hits')
        });


        /**
         * Total damage dealt
         * @type {number}
         */
        this.damageDealt;
        Object.defineProperty(this,'damageDealt',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','damage_dealt')
        });


        /**
         * Total assists
         * @type {number}
         */
        this.assists;
        Object.defineProperty(this,'assists',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','assists')
        });


        /**
         * Highest Streak
         * @type {number}
         */
        this.highestStreak;
        Object.defineProperty(this,'highestStreak',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','max_streak')
        });

        /**
         * Total blocks placed
         * @type {number}
         */
        this.blocksPlaced;
        Object.defineProperty(this,'blocksPlaced',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','blocks_placed')
        });

        /**
         * Total times launched by a launched
         * @type {number}
         */
        this.launcherLaunches;
        Object.defineProperty(this,'launcherLaunches',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','launched_by_launchers')
        });

        /**
        * Total diamond items purchased
        * @type {number}
        */
        this.diamondItemsPurchased;
        Object.defineProperty(this,'diamondItemsPurchased',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','diamond_items_purchased')
        });

        /**
         * Total wheat farmed
         * @type {number}
         */
        this.wheatFarmed;
        Object.defineProperty(this,'wheatFarmed',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','wheat_farmed')
        });

        /**
         * Total sewer treasures found
         * @type {number}
         */
        this.sewerTreasuresFound;
        Object.defineProperty(this,'sewerTreasuresFound',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','sewer_treasures_found')
        });

        /**
         * Total contracts completed
         * @type {number}
         */
        this.contractsCompleted;
        Object.defineProperty(this,'contractsCompleted',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','contracts_completed')
        });

        /**
         * Total contracts started
         * @type {number}
         */
        this.contractsStarted;
        Object.defineProperty(this,'contractsStarted',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','contracts_started')
        });

        /**
         * Total night quests completed
         * @type {number}
         */
        this.nightQuestsCompleted;
        Object.defineProperty(this,'nightQuestsCompleted',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','night_quests_completed')
        });

        /**
         * Total mystics encahnted of each tier
         * @type {Array<number>} [tier1, tier2, tier3]
         */
        this.mysticsEnchanted;
        Object.defineProperty(this,'mysticsEnchanted',{
            enumerable:true,
            get: ()=>[
                this.getStat('stats','Pit','pit_stats_ptl','enchanted_tier1')||0,
                this.getStat('stats','Pit','pit_stats_ptl','enchanted_tier2')||0,
                this.getStat('stats','Pit','pit_stats_ptl','enchanted_tier3')||0
            ]
        });

        /**
         * Total dark pants created
         * @type {number}
         */
        this.darkPantsCreated;
        Object.defineProperty(this,'darkPantsCreated',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','dark_pants_crated')
        });

        /**
         * Total dark pants enchanted to t2
         * @type {number}
         */
        this.darkPantsT2;
        Object.defineProperty(this,'darkPantsT2',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','dark_pants_t2')
        });

        /**
         * Total lava buckets placed
         * @type {number}
         */
        this.lavaBucketsPlaced;
        Object.defineProperty(this,'lavaBucketsPlaced',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','lava_buckets_emptied')
        });

        /**
         * Total blocks broken
         * @type {number}
         */
        this.blocksBroken;
        Object.defineProperty(this,'blocksBroken',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','blocks_broken')
        });

        /**
         * Total golden heads eaten
         * @type {number}
         */
        this.gheadsEaten;
        Object.defineProperty(this,'gheadsEaten',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','gheads_eaten')
        });

        /**
         * Total hidden jewels triggered
         * @type {number}
         */
        this.hiddenJewelsTriggered;
        Object.defineProperty(this,'hiddenJewelsTriggered',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','hidden_jewel_triggers')
        });

        /**
         * Total golden apples eaten
         * @type {number}
         */
        this.gapplesEaten;
        Object.defineProperty(this,'gapplesEaten',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','gapples_eaten')
        });

        /**
         * Total soups drank
         * @type {number}
         */
        this.soupsDrank;
        Object.defineProperty(this,'soupsDrank',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','soups_drank')
        });

        /**
         * Total gold earned from farming (sold to npc)
         * @type {number}
         */
        this.goldFromFarming;
        Object.defineProperty(this,'goldFromFarming',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','gold_from_farming')
        });

        /**
         * Total gold earned from selling fish
         * @type {number}
         */
        this.foldFromSellingFish;
        Object.defineProperty(this,'foldFromSellingFish',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','gold_from_selling_fish')
        });

        /**
         * Times the player has cast a fishing rod
         * @type {number}
         */
        this.fishingRodCasts;
        Object.defineProperty(this,'fishingRodCasts',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','fishing_rod_launched')
        });

        /**
         * Total fish fised
         * @type {number}
         */
        this.fishedFish;
        Object.defineProperty(this,'fishedFish',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','fishes_fished')
        });

        /**
         * Total times catching anything from fishing
         * @type {number}
         */
        this.fishedAnything;
        Object.defineProperty(this,'fishedAnything',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','fished_anything')
        });

        /**
         * Times the player has completed kinqs quest
         * @type {number}
         */
        this.kingsQuestCompletions;
        Object.defineProperty(this,'kingsQuestCompletions',{
            enumerable:true,
            get: ()=>this.getStat('stats','Pit','pit_stats_ptl','king_quest_completion')
        });
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
     * Calculates Player level from xp and prestige
     * @param {number} prestige
     * @param {number} xp 
     * @returns {Object} {level: Player level, extra: xp progress into next level, next: xp required for next level}
     */
    static calcLevel(prestige, xp){
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
                const gain = Math.floor(xp/levelXp);
                level+=gain;
                xp-=gain*levelXp;
                next = levelXp-xp;
                extra = xp;
                xp=0;
            }
        }
        return {level, extra, next};
    }

    /**
     * loads a hidden cache of player level details
     * @returns {void}
     */
    loadLevelCache = ()=>{
        Object.defineProperty(this,'levelCache',{
            value: Pit.calcLevel(this.prestige,this.prestigeXp),
            enumerable: false
        });
    }

    /**
     * Loads and caches the player's inventory
     * @returns {Promise<Item[]>}
     */
    loadInventory(){
        return new Promise(resolve=>{
            const rawInv = this.getStat('stats','Pit','profile','inv_contents','data');
            if(!rawInv) return resolve([]);
            parseInv(Buffer.from(rawInv)).then(items=>{
                /**
                 * Player's inventory
                 * @type {Item[]} 
                 */
                this.inventory = items;
                resolve(items.slice(9).concat(items.slice(0,9)));
            });
        });
    }

    /**
     * Loads and caches the player's Armor
     * @returns {Promise<Item[]>} 
     */
    loadArmor(){
        return new Promise(resolve=>{
            const rawInv = this.getStat('stats','Pit','profile','inv_armor','data');
            if(!rawInv) return resolve([]);
            parseInv(Buffer.from(rawInv)).then(arr=>{
                arr.reverse();
                /**
                 * Player's armor
                 * @type {Item[]} 
                 */
                this.armor = arr;
                resolve(arr);
            });
        });
    }

    /**
     * Loads and caches the player's Enderchest
     * @returns {Promise<Item[]>} 
     */
    loadEnderchest(){
        return new Promise(resolve=>{
            const rawInv = this.getStat('stats','Pit','profile','inv_enderchest','data');
            if(!rawInv) return resolve([]);
            parseInv(Buffer.from(rawInv)).then(items=>{
                /**
                 * Player's enderchest
                 * @type {Item[]} 
                 */
                this.enderchest = items;
                resolve(items);
            });
        });
    }

    /**
     * Loads and caches the player's Stash
     * @returns {Promise<Item[]>} 
     */
    loadStash(){
        return new Promise(resolve=>{
            const rawInv = this.getStat('stats','Pit','profile','item_stash','data');
            if(!rawInv) return resolve([]);
            parseInv(Buffer.from(rawInv)).then(items=>{
                /**
                 * Player's stash
                 * @type {Item[]} 
                 */
                this.stash = items;
                resolve(items);
            });
        });
    }

    /**
     * Loads and caches the player's Mystic Well
     * @returns {Promise<Item[]>} 
     */
    loadWell(){
        return new Promise(resolve=>{
            const invs = [
                this.getStat('stats','Pit','profile','mystic_well_item','data'),
                this.getStat('stats','Pit','profile','mystic_well_pants','data')
            ];
            Promise.all(
                invs.map(inv=>
                    new Promise(res=>
                        inv ? 
                            parseInv(Buffer.from(inv)).then(res) : 
                            res([])
                    )
                )
            ).then(result=>{
                result = result.flat(1);
                this.well = result;
                resolve(result);
            });
        });
    }

    loadInventorys(){
        return Promise.all([
            this.loadInventory(),
            this.loadArmor(),
            this.loadEnderchest(),
            this.loadStash(),
            this.loadWell()
        ]);
    }
} module.exports = Pit;

/**
 * Takes byte array and returns a promise for its decoded contents
 * @param {Buffer} byteArr 
 * @returns {Promise<Item[]>}
 */
function parseInv(byteArr){
    return new Promise(resolve=>nbt.parse(inflate(byteArr), (err,inv)=>{
        if(err) return resolve([]);
        else return resolve(inv.value.i.value.value.map(item=>new Item(item)));
    }));
}