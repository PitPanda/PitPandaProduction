const { getRef } = require('../apiTools/apiTools');
const pitMaster = require('../frontEnd/src/pitMaster.json');
const { Pit: { Levels, Prestiges, Upgrades, Perks, RenownUpgrades, Mystics }, Extra: { ColorCodes: Colors, RankPrefixes, RankNameColors } } = pitMaster;
const Item = require('./Item');
const SimpleItem = require('./SimpleItem');
const Prestige = require('./Prestige');
const Progress = require('./Progress');
const UnlockCollection = require('./UnlockCollection');
const { inflate } = require('pako');
const nbt = require('nbt');
const Mystic = require('../models/Mystic');
const Player = require('../models/Player');
const leaderboardFields = require('../models/Player/leaderboardFields');
const allowedStats = Object.keys(leaderboardFields);
const RedisClient = require('../utils/RedisClient');
const redisClient = new RedisClient(0);

const textHelpers = require('../utils/TextHelpers');

/**
 * Represents the player output from the Hypixel API
 */
class Pit {
    /**
     * Constructor for thr Pit class
     * @param {Object} json 
     */
    constructor(json) {

        /**
         * Raw hypixel output json
         * @type {Object}
         */
        this.raw;
        Object.defineProperty(this, 'raw', { value: json.player, enumerable: false });

        if (!json.success) return { error: json.err || 'Failed to reach the api' };
        if (!json.player) return { error: 'Player not found' };
        if (!this.getStat('stats', 'Pit')) {
            (async ()=>{
                const uuid = this.getStat('uuid');
                if(uuid) Player.deleteOne({_id:uuid}).exec();
            })();
            return { error: 'Player has not played the Pit' };
        }



        /**
         * User's linked discord account
         * @type {string}
         */
        this.discord;
        Object.defineProperty(this, 'discord', {
            enumerable: true,
            get: () => this.getStat('socialMedia', 'links', 'DISCORD')
        });

        /**
         * container for inventory formatted data
         * @type {object}
         */
        this.inventories = {};

        /**
         * container for raw inventory data
         * @type {object}
         */
        this.raw_inventories;
        Object.defineProperty(this, 'raw_inventories', {
            enumerable: false,
            value: {}
        });

        /**
         * container for simplified inventory data
         * @type {object}
         */
        this.simplified_inventories = {};

        /**
         * Array of Player's Prestige Details
         * @type {Prestige[]}
         */
        this.prestiges;
        Object.defineProperty(this, 'prestiges', {
            enumerable: true,
            get: () => {
                if (!this._prestiges) Object.defineProperty(this, '_prestiges', {
                    enumerable: false,
                    value: [
                        new Prestige(0, undefined, this.profile.unlocks, this.profile.cash_during_prestige_0),
                        ...this.prestigesRaw
                            .map((pres, index, original) =>
                                new Prestige(
                                    pres.index,
                                    pres.timestamp,
                                    this.profile[`unlocks_${pres.index}`],
                                    this.profile[`cash_during_prestige_${pres.index}`],
                                    this.renownShopUnlocksRaw.filter(({ acquireDate }) => acquireDate > pres.timestamp && acquireDate < (getRef(original, index + 1, 'timestamp') || Infinity))
                                )
                            )
                    ]
                });
                return this._prestiges;
            }
        });

        /**
         * Player's Pit prestige
         * @type {number}
         */
        this.prestige;
        Object.defineProperty(this, 'prestige', {
            enumerable: true,
            get: () => this.prestigesRaw.length
        });

        /**
         * Player's display name
         * @type {string}
         */
        this.name;
        Object.defineProperty(this, 'name', {
            enumerable: true,
            get: () => this.getStat('displayname') || 'Unknown'
        });

        /**
         * Player's uuid
         * @type {string}
         */
        this.uuid;
        Object.defineProperty(this, 'uuid', {
            enumerable: true,
            get: () => this.getStat('uuid') || 'Unknown'
        });

        /**
         * Player's server rank
         * @type {string}
         */
        this.rank;
        Object.defineProperty(this, 'rank', {
            enumerable: true,
            get: () => {
                let rank = this.getStat('newPackageRank') || this.getStat('PackageRank') || 'NON';
                if (this.getStat('monthlyPackageRank') == 'SUPERSTAR') rank = 'SUPERSTAR';
                const staff = this.getStat('rank');
                if (staff && staff != 'NORMAL') rank = staff;
                return rank;
            }
        });

        /**
         * Player's ingame color formatted name
         * @type {string}
         */
        this.formattedName;
        Object.defineProperty(this, 'formattedName', {
            enumerable: true,
            get: () => {
                return this.prefix + (this.rank !== 'NON' ? ' ' : '') + this.name;
            }
        });

        /**
         * Player's ingame color formatted name with level instead of rank
         * @type {string}
         */
        this.levelFormattedName;
        Object.defineProperty(this, 'levelFormattedName', {
            enumerable: true,
            get: () => {
                return this.formattedLevel + ' ' + this.colouredName;
            }
        });

        /**
         * Player's ingame color formatted level
         * @type {string}
         */
        this.formattedLevel;
        Object.defineProperty(this, 'formattedLevel', {
            enumerable: true,
            get: () => {
                let lc = pitMaster.Pit.Levels[Math.floor(this.level / 10)].ColorCode;
                if (this.prestige === 0) return Colors.GRAY + '[' + lc + this.level + Colors.RESET + Colors.GRAY + ']';
                let pc = pitMaster.Pit.Prestiges[this.prestige].ColorCode;
                return pc + '[' + Colors.YELLOW + textHelpers.romanNumGen(this.prestige) + pc + '-' + lc + this.level + Colors.RESET + pc + ']';
            }
        });

        /**
         * Player's ingame color prefix
         * @type {string}
         */
        this.prefix;
        Object.defineProperty(this, 'prefix', {
            enumerable: true,
            get: () => {
                const rank = this.rank;
                let prefix = this.getStat('prefix') || RankPrefixes[rank] || '§7';
                const plus = this.getStat('rankPlusColor');
                const rankColor = this.getStat('monthlyRankColor');
                prefix = prefix.replace(/\$/g, Colors[plus] || '§c');
                prefix = prefix.replace(/@/g, Colors[rankColor] || '§6');
                return prefix;
            }
        });

        /**
         * Player is online
         * @type {boolean}
         */
        this.online;
        Object.defineProperty(this, 'online', {
            enumerable: true,
            get: () => {
                const login = this.getStat('lastLogin');
                const logout = this.getStat('lastLogout');
                if (!login || !logout) return false;
                return login > logout;
            }
        });

        /**
         * unix epock timestamp (seconds) of the last time their pit profile was saved
         * @type {number}
         */
        this.lastSave = this.profile.last_save;

        /**
         * Player's current xp
         * @type {number}
         */
        this.xp;
        Object.defineProperty(this, 'xp', {
            enumerable: true,
            get: () => this.profile.xp || 0
        });

        /**
         * xp gained this prestige
         * @type {number}
         */
        this.prestigeXp;
        Object.defineProperty(this, 'prestigeXp', {
            enumerable: true,
            get: () => (this.prestige > 0) ? this.xp - Prestiges[this.prestige - 1].SumXp : this.xp
        });

        /**
         * XP progression details
         * @type {Progress}
         */
        this.xpProgress;
        Object.defineProperty(this, 'xpProgress', {
            enumerable: true,
            get: () => {
                if (!this._xpProgress) Object.defineProperty(this, '_xpProgress', {
                    enumerable: false,
                    value: new Progress(this.prestigeXp, Prestiges[this.prestige].TotalXp, (this.prestige === 35 && this.prestigeXp === Prestiges[this.prestige].TotalXp) ? 'Max XP' : undefined)
                });
                return this._xpProgress;
            }
        });

        /**
         * Integer level of the player
         * @type {number}
         */
        this.level;
        Object.defineProperty(this, 'level', {
            enumerable: true,
            get() {
                if (!this.levelCache) this.loadLevelCache();
                return this.levelCache.level
            }
        });

        /**
         * Xp to level up
         * @type {number}
         */
        this.xpToNextLevel;
        Object.defineProperty(this, 'xpToNextLevel', {
            enumerable: true,
            get() {
                if (!this.levelCache) this.loadLevelCache();
                return this.levelCache.next || undefined;
            }
        });

        /**
         * Xp progress on the current level
         * @type {number}
         */
        this.xpThisLevel;
        Object.defineProperty(this, 'xpThisLevel', {
            enumerable: true,
            get() {
                if (!this.levelCache) this.loadLevelCache();
                return this.levelCache.extra || undefined;
            }
        });

        /**
         * Current Gold
         * @type {number}
         */
        this.currentGold;
        Object.defineProperty(this, 'currentGold', {
            enumerable: true,
            get: () => Math.round(100 * (this.profile.cash || 0)) / 100
        });

        /**
         * Prestige Gold
         * @type {number}
         */
        this.prestigeGold;
        Object.defineProperty(this, 'prestigeGold', {
            enumerable: true,
            get: () => this.prestiges[this.prestige].gold
        });

        /**
         * Goal progression details
         * @type {Progress}
         */
        this.goldProgress;
        Object.defineProperty(this, 'goldProgress', {
            enumerable: true,
            get: () => {
                if (!this._goldProgress) Object.defineProperty(this, '_goldProgress', {
                    enumerable: false,
                    value: new Progress(this.prestigeGold, Prestiges[this.prestige].GoldReq, this.prestige === 35 ? 'Max Prestige' : false)
                });
                return this._goldProgress;
            }
        });

        /**
         * Renown unlocks
         * @type {UnlockEntry[]}
         */
        this.renownShop;
        Object.defineProperty(this, 'renownShop', {
            enumerable: true,
            get: () => this.renownShopCollection.raw
        });

        /**
         * renown progression details
         * @type {Progress}
         */
        this.renownProgress;
        Object.defineProperty(this, 'renownProgress', {
            enumerable: true,
            get: () => {
                if (!this._renownProgress) Object.defineProperty(this, '_renownProgress', {
                    enumerable: false,
                    value: new Progress(this.renownShop.length, 81, this.renownShop.length === 81 ? 'Max Shop' : false, this.renownShopSpent, 1980)
                });
                return this._renownProgress;
            }
        });

        /**
         * Equiped Perks
         * @type {string[]}
         */
        this.perks;
        Object.defineProperty(this, 'perks', {
            enumerable: true,
            get: () => {
                let arr = new Array(this.perkSlots).fill('none');
                for (let i = 0; i < this.perkSlots; i++)
                    arr[i] = this.profile[`selected_perk_${i}`] || arr[i];
                return arr;
            }
        });

        /**
         * Available Perk Slots
         * @type {number}
         */
        this.perkSlots = (this.renownShop.find(({ key }) => key == 'extra_perk_slot')) ? 4 : 3;

        /**
         * Current Renown
         * @type {number}
         */
        this.renown;
        Object.defineProperty(this, 'renown', {
            enumerable: true,
            get: () => this.profile.renown
        });

        /**
         * Total Renown earned
         * @type {number}
         */
        this.lifetimeRenown;
        Object.defineProperty(this, 'lifetimeRenown', {
            enumerable: true,
            get: () => {
                if (!this._lifetimeRenown) Object.defineProperty(this, '_lifetimeRenown', {
                    enumerable: false,
                    value: (this.renownShopSpent || 0) + (this.renown || 0) + 2 * (this.darkPantsCreated || 0)
                });
                return this._lifetimeRenown;
            }
        });

        /**
         * Total renown spent in the shop
         * @type {number}
         */
        this.renownShopSpent;
        Object.defineProperty(this, 'renownShopSpent', {
            enumerable: true,
            get: () => {
                if (!this._renownShopSpent) Object.defineProperty(this, '_renownShopSpent', {
                    enumerable: false,
                    value: this.renownShop.reduce((acc, entry) => acc + entry.cost, 0)
                });
                return this._renownShopSpent;
            }
        });

        /**
         * Current Bounty
         * @type {number}
         */
        this.bounty;
        Object.defineProperty(this, 'bounty', {
            enumerable: true,
            get: () => (this.profile.bounties || [])
                .reduce((acc, bump) => acc + bump.amount, 0) || undefined
        });

        /**
         * Playtime in minutes
         * @type {number}
         */
        this.playtime;
        Object.defineProperty(this, 'playtime', {
            enumerable: true,
            get: () => this.pitStatsPTL.playtime_minutes || 0
        });

        /**
         * Last kills
         * @type {{victim:string,timestamp:number}[]}
         */
        this.recentKills;
        Object.defineProperty(this, 'recentKills', {
            enumerable: true,
            get: () => (this.profile.recent_kills || []).reverse()
        });

        /**
         * Last kills simplified
         * @type {string[]}
         */
        this.recentKillsSimple;
        Object.defineProperty(this, 'recentKillsSimple', {
            enumerable: true,
            get: () => this.recentKills.map(kill => kill.victim)
        });

        /**
         * Times the player has opened the enderchest
         * @type {number}
         */
        this.enderchestOpened;
        Object.defineProperty(this, 'enderchestOpened', {
            enumerable: true,
            get: () => this.pitStatsPTL.enderchest_opened
        });

        /**
         * Times the player has joined a instance of the pit
         * @type {number}
         */
        this.joins;
        Object.defineProperty(this, 'joins', {
            enumerable: true,
            get: () => this.pitStatsPTL.joins
        });

        /**
         * Total messages send in chat in pit
         * @type {number}
         */
        this.chatMessages;
        Object.defineProperty(this, 'chatMessages', {
            enumerable: true,
            get: () => this.pitStatsPTL.chat_messages
        });

        /**
         * Player's hat color
         * @type {string} formatted color without the #
         */
        this.hatColor
        Object.defineProperty(this, 'hatColor', {
            enumerable: true,
            get: () => this.profile.hat_color
        });

        /**
         * Times the player has left clicked in pit
         * @type {number}
         */
        this.leftClicks;
        Object.defineProperty(this, 'leftClicks', {
            enumerable: true,
            get: () => this.pitStatsPTL.left_clicks
        });

        /**
         * Player kills
         * @type {number}
         */
        this.kills;
        Object.defineProperty(this, 'kills', {
            enumerable: true,
            get: () => this.pitStatsPTL.kills
        });

        /**
         * Times the player has died in the pit
         * @type {number}
         */
        this.deaths;
        Object.defineProperty(this, 'deaths', {
            enumerable: true,
            get: () => this.pitStatsPTL.deaths
        });

        /**
         * Total melee damage dealth by the player
         * @type {number}
         */
        this.meleeDamageDealt;
        Object.defineProperty(this, 'meleeDamageDealt', {
            enumerable: true,
            get: () => this.pitStatsPTL.melee_damage_dealt
        });

        /**
         * Ratio of damage dealt to recieved for melee only
         * @type {number}
         */
        this.meleeDamageRatio;
        Object.defineProperty(this, 'meleeDamageRatio', {
            enumerable: true,
            get: () => this.meleeDamageDealt/(this.meleeDamageReceived||1)
        });

        /**
         * Ratio of damage dealt to recieved for bow only
         * @type {number}
         */
        this.bowDamageRatio;
        Object.defineProperty(this, 'bowDamageRatio', {
            enumerable: true,
            get: () => this.bowDamageDealt/(this.bowDamageReceived||1)
        });

        /**
         * Total sword hits
         * @type {number}
         */
        this.swordHits;
        Object.defineProperty(this, 'swordHits', {
            enumerable: true,
            get: () => this.pitStatsPTL.sword_hits
        });

        /**
         * Lifetime gold earned
         * @type {number}
         */
        this.lifetimeGold;
        Object.defineProperty(this, 'lifetimeGold', {
            enumerable: true,
            get: () => this.pitStatsPTL.cash_earned
        });

        /**
         * Total arrows fired
         * @type {number}
         */
        this.arrowsFired;
        Object.defineProperty(this, 'arrowsFired', {
            enumerable: true,
            get: () => this.pitStatsPTL.arrows_fired
        });

        /**
         * Total bow damage dealth
         * @type {number}
         */
        this.bowDamageDealt;
        Object.defineProperty(this, 'bowDamageDealt', {
            enumerable: true,
            get: () => this.pitStatsPTL.bow_damage_dealt
        });


        /**
         * Total bow damage received
         * @type {number}
         */
        this.bowDamageReceived;
        Object.defineProperty(this, 'bowDamageReceived', {
            enumerable: true,
            get: () => this.pitStatsPTL.bow_damage_received
        });


        /**
         * Total damage received
         * @type {number}
         */
        this.damageReceived;
        Object.defineProperty(this, 'damageReceived', {
            enumerable: true,
            get: () => this.pitStatsPTL.damage_received
        });


        /**
         * Total jumps in the pit (center only)
         * @type {number}
         */
        this.jumpsIntoPit;
        Object.defineProperty(this, 'jumpsIntoPit', {
            enumerable: true,
            get: () => this.pitStatsPTL.jumped_into_pit
        });


        /**
         * Total melee damage received
         * @type {number}
         */
        this.meleeDamageReceived;
        Object.defineProperty(this, 'meleeDamageReceived', {
            enumerable: true,
            get: () => this.pitStatsPTL.melee_damage_received
        });


        /**
         * Total arrow hits
         * @type {number}
         */
        this.arrowHits;
        Object.defineProperty(this, 'arrowHits', {
            enumerable: true,
            get: () => this.pitStatsPTL.arrow_hits
        });


        /**
         * Total damage dealt
         * @type {number}
         */
        this.damageDealt;
        Object.defineProperty(this, 'damageDealt', {
            enumerable: true,
            get: () => this.pitStatsPTL.damage_dealt
        });


        /**
         * Total assists
         * @type {number}
         */
        this.assists;
        Object.defineProperty(this, 'assists', {
            enumerable: true,
            get: () => this.pitStatsPTL.assists
        });


        /**
         * Highest Streak
         * @type {number}
         */
        this.highestStreak;
        Object.defineProperty(this, 'highestStreak', {
            enumerable: true,
            get: () => this.pitStatsPTL.max_streak
        });

        /**
         * Total blocks placed
         * @type {number}
         */
        this.blocksPlaced;
        Object.defineProperty(this, 'blocksPlaced', {
            enumerable: true,
            get: () => this.pitStatsPTL.blocks_placed
        });

        /**
         * Total times launched by a launched
         * @type {number}
         */
        this.launcherLaunches;
        Object.defineProperty(this, 'launcherLaunches', {
            enumerable: true,
            get: () => this.pitStatsPTL.launched_by_launchers
        });

        /**
        * Total diamond items purchased
        * @type {number}
        */
        this.diamondItemsPurchased;
        Object.defineProperty(this, 'diamondItemsPurchased', {
            enumerable: true,
            get: () => this.pitStatsPTL.diamond_items_purchased
        });

        /**
         * Total wheat farmed
         * @type {number}
         */
        this.wheatFarmed;
        Object.defineProperty(this, 'wheatFarmed', {
            enumerable: true,
            get: () => this.pitStatsPTL.wheat_farmed
        });

        /**
         * Total sewer treasures found
         * @type {number}
         */
        this.sewerTreasuresFound;
        Object.defineProperty(this, 'sewerTreasuresFound', {
            enumerable: true,
            get: () => this.pitStatsPTL.sewer_treasures_found
        });

        /**
         * Total contracts completed
         * @type {number}
         */
        this.contractsCompleted;
        Object.defineProperty(this, 'contractsCompleted', {
            enumerable: true,
            get: () => this.pitStatsPTL.contracts_completed
        });

        /**
         * Total contracts started
         * @type {number}
         */
        this.contractsStarted;
        Object.defineProperty(this, 'contractsStarted', {
            enumerable: true,
            get: () => this.pitStatsPTL.contracts_started
        });

        /**
         * Total night quests completed
         * @type {number}
         */
        this.nightQuestsCompleted;
        Object.defineProperty(this, 'nightQuestsCompleted', {
            enumerable: true,
            get: () => this.pitStatsPTL.night_quests_completed
        });

        /**
         * Total mystics encahnted of each tier
         * @type {Array<number>} [tier1, tier2, tier3]
         */
        this.mysticsEnchanted;
        Object.defineProperty(this, 'mysticsEnchanted', {
            enumerable: true,
            get: () => [
                this.pitStatsPTL.enchanted_tier1 || 0,
                this.pitStatsPTL.enchanted_tier2 || 0,
                this.pitStatsPTL.enchanted_tier3 || 0
            ]
        });

        /**
         * Total dark pants created
         * @type {number}
         */
        this.darkPantsCreated;
        Object.defineProperty(this, 'darkPantsCreated', {
            enumerable: true,
            get: () => this.pitStatsPTL.dark_pants_crated
        });

        /**
         * Total dark pants enchanted to t2
         * @type {number}
         */
        this.darkPantsT2;
        Object.defineProperty(this, 'darkPantsT2', {
            enumerable: true,
            get: () => this.pitStatsPTL.dark_pants_t2
        });

        /**
         * Gold trade limit usage
         * @type {number}
         */
        this.tradeGold;
        Object.defineProperty(this, 'tradeGold', {
            enumerable: true,
            get: () => this.trades.reduce((acc, trade) => acc + trade.amount, 0)
        });

        /**
         * Trade limit usage
         * @type {number}
         */
        this.tradeCount;
        Object.defineProperty(this, 'tradeCount', {
            enumerable: true,
            get: () => this.trades.length
        });

        /**
         * Total lava buckets placed
         * @type {number}
         */
        this.lavaBucketsPlaced;
        Object.defineProperty(this, 'lavaBucketsPlaced', {
            enumerable: true,
            get: () => this.pitStatsPTL.lava_bucket_emptied
        });

        /**
         * Total blocks broken
         * @type {number}
         */
        this.blocksBroken;
        Object.defineProperty(this, 'blocksBroken', {
            enumerable: true,
            get: () => this.pitStatsPTL.blocks_broken
        });

        /**
         * Total golden heads eaten
         * @type {number}
         */
        this.gheadsEaten;
        Object.defineProperty(this, 'gheadsEaten', {
            enumerable: true,
            get: () => this.pitStatsPTL.ghead_eaten
        });

        /**
         * Total hidden jewels triggered
         * @type {number}
         */
        this.hiddenJewelsTriggered;
        Object.defineProperty(this, 'hiddenJewelsTriggered', {
            enumerable: true,
            get: () => this.pitStatsPTL.hidden_jewel_triggers
        });

        /**
         * Total golden apples eaten
         * @type {number}
         */
        this.gapplesEaten;
        Object.defineProperty(this, 'gapplesEaten', {
            enumerable: true,
            get: () => this.pitStatsPTL.gapple_eaten
        });

        /**
         * Total soups drank
         * @type {number}
         */
        this.soupsDrank;
        Object.defineProperty(this, 'soupsDrank', {
            enumerable: true,
            get: () => this.pitStatsPTL.soups_drank
        });

        /**
         * Total hay bales sold
         * @type {number}
         */
        this.balesSold;
        Object.defineProperty(this, 'balesSold', {
            enumerable: true,
            get: () => this.pitStatsPTL.gold_from_farming
        });

        /**
         * Total fish sold
         * @type {number}
         */
        this.fishSold;
        Object.defineProperty(this, 'fishSold', {
            enumerable: true,
            get: () => this.pitStatsPTL.gold_from_selling_fish
        });

        /**
         * Times the player has cast a fishing rod
         * @type {number}
         */
        this.fishingRodCasts;
        Object.defineProperty(this, 'fishingRodCasts', {
            enumerable: true,
            get: () => this.pitStatsPTL.fishing_rod_launched
        });

        /**
         * Total fish fised
         * @type {number}
         */
        this.fishedFish;
        Object.defineProperty(this, 'fishedFish', {
            enumerable: true,
            get: () => this.pitStatsPTL.fishes_fished
        });

        /**
         * Total times catching anything from fishing
         * @type {number}
         */
        this.fishedAnything;
        Object.defineProperty(this, 'fishedAnything', {
            enumerable: true,
            get: () => this.pitStatsPTL.fished_anything
        });

        /**
         * Times the player has completed kinqs quest
         * @type {number}
         */
        this.kingsQuestCompletions;
        Object.defineProperty(this, 'kingsQuestCompletions', {
            enumerable: true,
            get: () => this.pitStatsPTL.king_quest_completion
        });

        /**
         * promise for when inventories will be loaded
         * @type {Promise<Item[][] | void>}
         */
        this.NBTInventoryPromise;
        Object.defineProperty(this, 'NBTInventoryPromise', {
            enumerable: false,
            value: Promise.all([
                this.loadInventory(),
                this.loadArmor(),
                this.loadEnderchest(),
                this.loadStash(),
                this.loadWell()
            ])
        });

        /**
         * Player's main inventory
         * @type {Item[]}
         */
        this.inventories.main;
        Object.defineProperty(this.inventories, 'main', {
            enumerable: true,
            get: () => this.raw_inventories.main.map(Item.buildFromNBT)
        });

        /**
         * Player's armor
         * @type {Item[]}
         */
        this.inventories.armor;
        Object.defineProperty(this.inventories, 'armor', {
            enumerable: true,
            get: () => this.raw_inventories.armor.map(Item.buildFromNBT)
        });

        /**
         * Player's enderchest
         * @type {Item[]}
         */
        this.inventories.enderchest;
        Object.defineProperty(this.inventories, 'enderchest', {
            enumerable: true,
            get: () => this.raw_inventories.enderchest.map(Item.buildFromNBT)
        });

        /**
         * Player's stash
         * @type {Item[]}
         */
        this.inventories.stash;
        Object.defineProperty(this.inventories, 'stash', {
            enumerable: true,
            get: () => this.raw_inventories.stash.map(Item.buildFromNBT)
        });

        /**
         * Player's well
         * @type {Item[]}
         */
        this.inventories.well;
        Object.defineProperty(this.inventories, 'well', {
            enumerable: true,
            get: () => this.raw_inventories.well.map(Item.buildFromNBT)
        });

        /**
         * Player's main inventory
         * @type {SimpleItem[]}
         */
        this.simplified_inventories.main;
        Object.defineProperty(this.simplified_inventories, 'main', {
            enumerable: true,
            get: () => this.raw_inventories.main.map(SimpleItem.buildFromNBT)
        });

        /**
         * Player's armor
         * @type {SimpleItem[]}
         */
        this.simplified_inventories.armor;
        Object.defineProperty(this.simplified_inventories, 'armor', {
            enumerable: true,
            get: () => this.raw_inventories.armor.map(SimpleItem.buildFromNBT)
        });

        /**
         * Player's enderchest
         * @type {SimpleItem[]}
         */
        this.simplified_inventories.enderchest;
        Object.defineProperty(this.simplified_inventories, 'enderchest', {
            enumerable: true,
            get: () => this.raw_inventories.enderchest.map(SimpleItem.buildFromNBT)
        });

        /**
         * Player's stash
         * @type {SimpleItem[]}
         */
        this.simplified_inventories.stash;
        Object.defineProperty(this.simplified_inventories, 'stash', {
            enumerable: true,
            get: () => this.raw_inventories.stash.map(SimpleItem.buildFromNBT)
        });

        /**
         * Player's faction allegiance
         * @type {string}
         */
        this.allegiance;
        Object.defineProperty(this, 'allegiance', {
            enumerable: true,
            get: () => this.profile.genesis_allegiance
        });

        /**
         * Player's faction allegiance points
         * @type {number}
         */
        this.allegiancePoints;
        Object.defineProperty(this, 'allegiancePoints', {
            enumerable: true,
            get: () => this.profile.genesis_points
        });

        /**
         * Player's well
         * @type {SimpleItem[]}
         */
        this.simplified_inventories.well;
        Object.defineProperty(this.simplified_inventories, 'well', {
            enumerable: true,
            get: () => this.raw_inventories.well.map(SimpleItem.buildFromNBT)
        });

        /**
         * Player's live database document
         * @type {Promise<Document>}
         */
        this.playerDoc;
        Object.defineProperty(this,'playerDoc',{
            enumerable: false,
            value: new Promise(resolve=>Player.findByIdAndUpdate(this.uuid, { $set: this.createPlayerDoc() }, { upsert: true, new: true }).then(resolve))
        });

        this.playerDoc.then(doc=>{
            if(doc.exempt) return;
            Object.entries(doc.toObject()).map(async d=>{
                const key = d[0];
                const value = d[1];
                if (!allowedStats.includes(key)) return;
                await redisClient.set(key, this.uuid, value);
            })
        });
    }

    /**
     * Gets a specific value from the player's raw data
     * @param  {...string} path 
     * @returns {any}
     */
    getStat(...path) {
        return getRef(this.raw, ...path);
    }

    /**
     * raw api prestige array
     * @returns {{tier:number,timestamp:number,key:String}[]}
     */
    get prestigesRaw() {
        return this.profile.prestiges || [];
    }

    /**
     * UnlockCollection formatted version of unlocks
     * @type {UnlockCollection}
     */
    get renownShopCollection() {
        if (!this._renownShop) Object.defineProperty(this, '_renownShop', {
            enumerable: false,
            value: new UnlockCollection(this.renownShopUnlocksRaw, this.raw)
        });
        return this._renownShop;
    }

    /**
     * raw api for renown unlocks
     * @type {Object[]}
     */
    get renownShopUnlocksRaw() {
        return this.profile.renown_unlocks || [];
    }

    /**
     * marks if the player has pit_stats_ptl or not
     * @type {boolean}
     */
    get hasStats() {
        return Boolean(this.getStat('stats', 'Pit', 'pit_stats_ptl'));
    }

    /**
     * Playtime (minutes) but never 0
     * @type {number}
     */
    get playtimeSafe() {
        return this.playtime || 1;
    }

    /**
     * Playtime in hours
     * @type {number}
     */
    get playtimeHours() {
        return this.playtime / 60;
    }

    /**
     * Contract Completed / Contracts Started
     * @type {number}
     */
    get contractsRatio() {
        return this.contractsCompleted / (this.contractsStarted||1);
    }

    /**
     * Playtime (hours) but never 0
     * @type {number}
     */
    get playtimeHoursSafe() {
        return this.playtimeSafe / 60;
    }

    /**
     * Perks but with common names
     * @type {string[]}
     */
    get prettyPerks() {
        return this.perks.map(perk => Perks[perk].Name);
    }

    /**
     * xp/hours 
     * @type {number}
     */
    get xpHourly() {
        return this.xp / this.playtimeHoursSafe;
    }

    /**
     * gold/hours 
     * @type {number}
     */
    get goldHourly() {
        return this.lifetimeGold / this.playtimeHoursSafe;
    }

    /**
     * player deaths but never 0
     * @type {number}
     */
    get deathsSafe() {
        return this.deaths || 1;
    }

    /**
     * kills/deaths
     * @type {number}
     */
    get killDeathRatio() {
        return this.kills / this.deathsSafe;
    }

    /**
     * (kills+assists)/deaths
     * @type {number}
     */
    get killAssistDeathRatio() {
        return (this.kills + this.assists) / this.deathsSafe;
    }

    /**
     * (kills+assists)/hours
     * @type {number}
     */
    get killAssistHourly() {
        return (this.kills + this.assists) / this.playtimeHoursSafe;
    }
    
    /**
     * kills/hours
     * @type {number}
     */
    get killsHourly() {
        return this.kills / this.playtimeHoursSafe;
    }
    /**
     * damage received but not 0
     * @type {number}
     */
    get damageReceivedSafe() {
        return this.damageReceived || 1;
    }

    /**
     * player should spawn in their faction base
     * @type {boolean}
     */
    get shouldSpawnInBase() {
        return this.profile.genesis_spawn_in_base;
    }

    /**
     * timestamp of last faction change (i think)
     * @type {number} date resolvable
     */
    get shouldSpawnInBase() {
        return this.profile.genesis_allegiance_time;
    }

    /**
     * damage given / damage received
     * @type {number}
     */
    get damageRatio() {
        return this.damageDealt / this.damageReceivedSafe;
    }

    /**
     * arrows fired but not 0
     * @type {number}
     */
    get arrowsFiredSafe() {
        return this.arrowsFired || 1;
    }

    /**
     * bow accuracy [0,1]
     * @type {number}
     */
    get bowAccuracy() {
        return this.arrowHits / this.arrowsFiredSafe;
    }

    /**
     * shortcut to pit_stats_ptl
     * @type {Object}
     */
    get pitStatsPTL(){
        return this.getStat('stats', 'Pit', 'pit_stats_ptl') || {};
    }

    /**
     * shortcut to profile
     * @type {Object}
     */
    get profile(){
        return this.getStat('stats', 'Pit', 'profile') || {};
    }

    /**
     * Calculates Player level from xp and prestige
     * @param {number} prestige
     * @param {number} xp 
     * @returns {Object} {level: Player level, extra: xp progress into next level, next: xp required for next level}
     */
    static calcLevel(prestige, xp) {
        let multiplier = Prestiges[prestige].Multiplier;
        let level = 0;
        let extra = 0;
        let next = 0;
        while (xp > 0 && level < 120) {
            const levelXp = Levels[Math.floor(level / 10)].Xp * multiplier;
            if (xp >= levelXp * 10) {
                xp -= levelXp * 10;
                level += 10;
                if (xp == 0) {
                    if (!level == 120) extra = Levels[Math.floor(level / 10)].Xp * multiplier;
                }
            } else {
                const gain = Math.floor(xp / levelXp);
                level += gain;
                xp -= gain * levelXp;
                next = levelXp - xp;
                extra = xp;
                xp = 0;
            }
        }
        return { level, extra, next };
    }

    /**
     * loads a hidden cache of player level details
     * @returns {void}
     */
    loadLevelCache = () => {
        Object.defineProperty(this, 'levelCache', {
            value: Pit.calcLevel(this.prestige, this.prestigeXp),
            enumerable: false
        });
    }

    get inventoriesNBT(){
        return {
            inventory: this.inventoryNBT, 
            enderchest: this.enderchestNBT, 
            armor: this.armorNBT, 
            stash: this.stashNBT,
            mysticWellItem: this.mysticWellItemNBT,
            mysticWellPants: this.mysticWellPantsNBT
        };
    }

     /**
     * NBT data for inventory slots
     * @returns {any}
     */
    get inventoryNBT(){
        return this.getStat('stats', 'Pit', 'profile', 'inv_contents', 'data');
    }

    /**
     * Loads and caches the player's inventory
     * @returns {Promise<any[] | void>}
     */
    loadInventory() {
        return new Promise(resolve => {
            if (this.raw_inventories.main) return resolve(this.raw_inventories.main);
            const rawInv = this.inventoryNBT;
            if (!rawInv) {
                this.raw_inventories.main = [];
                return resolve([]);
            }
            this.parseInv(Buffer.from(rawInv)).then(items => {
                /**
                 * Player's main inventory
                 * @type {any[]} 
                 */
                items = items.slice(9).concat(items.slice(0, 9));
                this.raw_inventories.main = items;
                resolve(items);
            });
        });
    }

    /**
     * NBT data for armor slots
     * @returns {any}
     */
    get armorNBT(){
        return this.getStat('stats', 'Pit', 'profile', 'inv_armor', 'data');
    }

    /**
     * Loads and caches the player's Armor
     * @returns {Promise<any[] | void>} 
     */
    loadArmor() {
        return new Promise(resolve => {
            if (this.raw_inventories.armor) return resolve(this.raw_inventories.armor);
            const rawInv = this.armorNBT;
            if (!rawInv) {
                this.raw_inventories.armor = [];
                return resolve([]);
            }
            this.parseInv(Buffer.from(rawInv)).then(arr => {
                arr.reverse();
                /**
                 * Player's armor
                 * @type {any[]} 
                 */
                this.raw_inventories.armor = arr;
                resolve(arr);
            });
        });
    }

    /**
     * NBT data for enderchest slots
     * @returns {any}
     */
    get enderchestNBT(){
        return this.getStat('stats', 'Pit', 'profile', 'inv_enderchest', 'data');
    }

    /**
     * Loads and caches the player's Enderchest
     * @returns {Promise<any[] | void>} 
     */
    loadEnderchest() {
        return new Promise(resolve => {
            if (this.raw_inventories.enderchest) return resolve(this.raw_inventories.enderchest);
            const rawInv = this.enderchestNBT;
            if (!rawInv) {
                this.raw_inventories.enderchest = [];
                return resolve([]);
            }
            this.parseInv(Buffer.from(rawInv)).then(items => {
                /**
                 * Player's enderchest
                 * @type {any[]} 
                 */
                this.raw_inventories.enderchest = items;
                resolve(items);
            });
        });
    }

     /**
     * NBT data for stash slots
     * @returns {any}
     */
    get stashNBT(){
        return this.getStat('stats', 'Pit', 'profile', 'item_stash', 'data');
    }

    /**
     * Loads and caches the player's Stash
     * @returns {Promise<any[] | void>} 
     */
    loadStash() {
        return new Promise(resolve => {
            if (this.raw_inventories.stash) return resolve(this.raw_inventories.stash);
            const rawInv = this.stashNBT;
            if (!rawInv) {
                this.raw_inventories.stash = [];
                return resolve([]);
            }
            this.parseInv(Buffer.from(rawInv)).then(items => {
                /**
                 * Player's stash
                 * @type {any[]} 
                 */
                this.raw_inventories.stash = items;
                resolve(items);
            });
        });
    }

     /**
     * NBT data for mystic well item
     * @returns {any}
     */
    get mysticWellItemNBT(){
        return this.getStat('stats', 'Pit', 'profile', 'mystic_well_item', 'data');
    }

     /**
     * NBT data for mystic well pants
     * @returns {any}
     */
    get mysticWellPantsNBT(){
        return this.getStat('stats', 'Pit', 'profile', 'mystic_well_pants', 'data');
    }

    /**
     * Loads and caches the player's Mystic Well
     * @returns {Promise<any[] | void>}
     */
    loadWell() {
        return new Promise(resolve => {
            if (this.raw_inventories.well) return resolve(this.raw_inventories.well);
            const invs = [
                this.mysticWellItemNBT,
                this.mysticWellPantsNBT
            ];
            Promise.all(
                invs.map(inv =>
                    new Promise(res =>
                        inv ?
                            this.parseInv(Buffer.from(inv)).then(res) :
                            res([])
                    )
                )
            ).then(result => {
                result = result.flat(1);
                /**
                 * Player's Mystic Well Items
                 * @type {Item[]}
                 */
                this.raw_inventories.well = result;
                resolve(this.raw_inventories.well);
            });
        });
    }

    /**
     * Loads all inventories
     * @returns {Promise<void>} not actually void but just dont even do it
     */
    loadInventorys() {
        return Promise.all([
            this.NBTInventoryPromise,
            this.buildPerkInventory(),
            this.buildUpgradeInventory(),
            this.buildRenownUpgradeInventory(),
            this.buildStatsInventory()
        ]);
    }

    /**
     * Builds custom inventories
     * @returns {{perks:Item[],upgrades:Item[],renownShop:Item[],generalStats:Item[]}}
     */
    buildCustominventories() {
        return {
            perks:this.buildPerkInventory(),
            upgrades:this.buildUpgradeInventory(),
            renownShop:this.buildRenownUpgradeInventory(),
            generalStats:this.buildStatsInventory()
        }
    }

    /**
     * Builds an inventory format of their Perks
     * @type {void | Item[]}
     */
    buildPerkInventory() {
        const perks = this.perks;
        const inv = perks.map(key => {
            if (key === 'none') return {};
            const perk = Perks[key];
            return new Item('§9' + perk.Name, perk.Description, perk.Item.Id, perk.Item.Meta);
        });
        /**
         * Player's selected perks
         * @type {Item[]}
         */
        this.inventories.perks = inv;
        return inv;
    }

    /**
     * Builds an inventory format of their Upgrades
     * @type {void | Item[]}
     */
    buildUpgradeInventory() {
        const inv = Object.keys(Upgrades).map(this.prestiges[this.prestige].unlocksCollection.buildItem);
        /**
         * Player's Upgrades
         * @type {Item[]}
         */
        this.inventories.upgrades = inv;
        return inv;
    }

    /**
     * Builds an inventory format of their Upgrades
     * @type {void | Item[]}
     */
    buildRenownUpgradeInventory() {
        const inv = Object.keys(RenownUpgrades).map(this.renownShopCollection.buildItem);
        /**
         * Player's Renown Shop Upgrades
         * @type {Item[]}
         */
        this.inventories.renownShop = inv;
        return inv;
    }

    /**
     * Builds a inventory of their player statistics
     * @type {void | Item[]}
     */
    buildStatsInventory() {
        /**
         * General stats inventory
         * @type {Item[]}
         */
        this.inventories.generalStats;
        if (this.hasStats) {
            const offlore = [
                `${Colors.GRAY}Kills: ${Colors.GREEN}${textHelpers.formatNumber(this.kills)}`,
                `${Colors.GRAY}Assists: ${Colors.GREEN}${textHelpers.formatNumber(this.assists)}`,
                `${Colors.GRAY}Sword Hits: ${Colors.GREEN}${textHelpers.formatNumber(this.swordHits)}`,
                `${Colors.GRAY}Arrows Shot: ${Colors.GREEN}${textHelpers.formatNumber(this.arrowsFired)}`,
                `${Colors.GRAY}Arrows Hit: ${Colors.GREEN}${textHelpers.formatNumber(this.arrowHits)}`,
                `${Colors.GRAY}Damage Dealt: ${Colors.GREEN}${textHelpers.formatNumber(this.damageDealt)}`,
                `${Colors.GRAY}Melee Damage Dealt: ${Colors.GREEN}${textHelpers.formatNumber(this.meleeDamageDealt)}`,
                `${Colors.GRAY}Bow Damage Dealt: ${Colors.GREEN}${textHelpers.formatNumber(this.bowDamageDealt)}`,
                `${Colors.GRAY}Highest Streak: ${Colors.GREEN}${textHelpers.formatNumber(this.highestStreak)}`
            ];
            const deflore = [
                `${Colors.GRAY}Deaths: ${Colors.GREEN}${textHelpers.formatNumber(this.deaths)}`,
                `${Colors.GRAY}Damage Taken: ${Colors.GREEN}${textHelpers.formatNumber(this.damageReceived)}`,
                `${Colors.GRAY}Melee Damage Taken: ${Colors.GREEN}${textHelpers.formatNumber(this.meleeDamageReceived)}`,
                `${Colors.GRAY}Bow Damage Taken: ${Colors.GREEN}${textHelpers.formatNumber(this.bowDamageReceived)}`
            ];
            const perflore = [
                `${Colors.GRAY}XP: ${Colors.AQUA}${textHelpers.formatNumber(this.xp)}`,
                `${Colors.GRAY}XP/hour: ${Colors.AQUA}${textHelpers.formatNumber(Math.round(this.xpHourly))}`,
                `${Colors.GRAY}Gold Earned: ${Colors.GOLD}${textHelpers.formatNumber(this.lifetimeGold)}g`,
                `${Colors.GRAY}Gold/hour: ${Colors.GOLD}${textHelpers.formatNumber(Math.round(this.goldHourly))}g`,
                `${Colors.GRAY}K/D: ${Colors.GREEN}${textHelpers.formatNumber(this.killDeathRatio)}`,
                `${Colors.GRAY}K+A/D: ${Colors.GREEN}${textHelpers.formatNumber(this.killAssistDeathRatio)}`,
                `${Colors.GRAY}K+A/hour: ${Colors.GREEN}${textHelpers.formatNumber(this.killAssistHourly)}`,
                `${Colors.GRAY}Damage dealt/taken: ${Colors.GREEN}${textHelpers.formatNumber(this.damageRatio)}`,
                `${Colors.GRAY}Bow Accuracy: ${Colors.GREEN}${textHelpers.formatNumber(Math.round(this.bowAccuracy * 1000) / 10)}%`,
                `${Colors.GRAY}Hours played: ${Colors.GREEN}${textHelpers.formatNumber(Math.round(this.playtimeHours))}`,
                `${Colors.GRAY}Contracts Started: ${Colors.GREEN}${textHelpers.formatNumber(this.contractsStarted)}`,
                `${Colors.GRAY}Contracts Completed: ${Colors.GREEN}${textHelpers.formatNumber(this.contractsCompleted)}`
            ];
            const perkmyslore = [
                `${Colors.GRAY}Golden Apples Eaten: ${Colors.GREEN}${textHelpers.formatNumber(this.gapplesEaten)}`,
                `${Colors.GRAY}Golden Heads Eaten: ${Colors.GREEN}${textHelpers.formatNumber(this.gheadsEaten)}`,
                `${Colors.GRAY}Lava Buckets Emptied: ${Colors.GREEN}${textHelpers.formatNumber(this.lavaBucketsPlaced)}`,
                `${Colors.GRAY}Fishing Rods Launched: ${Colors.GREEN}${textHelpers.formatNumber(this.fishingRodCasts)}`,
                `${Colors.GRAY}Soups Drank: ${Colors.GREEN}${textHelpers.formatNumber(this.soupsDrank)}`,
                `${Colors.GRAY}T1 Mystics Enchanted: ${Colors.GREEN}${textHelpers.formatNumber(this.mysticsEnchanted[0])}`,
                `${Colors.GRAY}T2 Mystics Enchanted: ${Colors.GREEN}${textHelpers.formatNumber(this.mysticsEnchanted[1])}`,
                `${Colors.GRAY}T3 Mystics Enchanted: ${Colors.GREEN}${textHelpers.formatNumber(this.mysticsEnchanted[2])}`,
                `${Colors.GRAY}Dark Pants Created: ${Colors.GREEN}${textHelpers.formatNumber(this.darkPantsCreated)}`
            ];
            const misclore = [
                `${Colors.GRAY}Left Clicks: ${Colors.GREEN}${textHelpers.formatNumber(this.leftClicks)}`,
                `${Colors.GRAY}Diamond Items Purchased: ${Colors.GREEN}${textHelpers.formatNumber(this.diamondItemsPurchased)}`,
                `${Colors.GRAY}Chat messages: ${Colors.GREEN}${textHelpers.formatNumber(this.chatMessages)}`,
                `${Colors.GRAY}Blocks Placed: ${Colors.GREEN}${textHelpers.formatNumber(this.blocksPlaced)}`,
                `${Colors.GRAY}Blocks Broken: ${Colors.GREEN}${textHelpers.formatNumber(this.blocksBroken)}`,
                `${Colors.GRAY}Jumps into Pit: ${Colors.GREEN}${textHelpers.formatNumber(this.jumpsIntoPit)}`,
                `${Colors.GRAY}Launcher Launches: ${Colors.GREEN}${textHelpers.formatNumber(this.launcherLaunches)}`,
                `${Colors.GRAY}Daily Trades: ${Colors.GREEN}${this.tradeCount}/12`,
                `${Colors.GRAY}Gold Trade Limit: ${Colors.GOLD}${textHelpers.formatNumber(this.tradeGold)}/50,000`,
                `${Colors.GRAY}Genesis Points: ${this.allegiance ? `${this.allegiance === 'DEMON' ? Colors.DARK_RED : Colors.AQUA}${textHelpers.formatNumber(this.allegiancePoints)}` : `${Colors.GREEN}N/A`}`,
            ];
            const farmlore = [
                `${Colors.GRAY}Wheat Farmed: ${Colors.GREEN}${textHelpers.formatNumber(this.wheatFarmed)}`,
                `${Colors.GRAY}Fished Anything: ${Colors.GREEN}${textHelpers.formatNumber(this.fishedAnything)}`,
                `${Colors.GRAY}Fished Fish: ${Colors.GREEN}${textHelpers.formatNumber(this.fishedFish)}`,
                `${Colors.GRAY}Fish Sold: ${Colors.GREEN}${textHelpers.formatNumber(this.fishSold)}`,
                `${Colors.GRAY}Hay Bales Sold: ${Colors.GREEN}${textHelpers.formatNumber(this.balesSold)}`,
                `${Colors.GRAY}King's Quest Completions: ${Colors.GREEN}${textHelpers.formatNumber(this.kingsQuestCompletions)}`,
                `${Colors.GRAY}Sewer Treasures Found: ${Colors.GREEN}${textHelpers.formatNumber(this.sewerTreasuresFound)}`,
                `${Colors.GRAY}Night Quests Completed: ${Colors.GREEN}${textHelpers.formatNumber(this.nightQuestsCompleted)}`
            ];
            const presstats = [
                `${Colors.GRAY}Prestige: ${Colors.GREEN}${textHelpers.formatNumber(this.prestige)}`,
                `${Colors.GRAY}Current Renown: ${Colors.GREEN}${textHelpers.formatNumber(this.renown)}`,
                `${Colors.GRAY}Lifetime Renown: ${Colors.GREEN}${textHelpers.formatNumber(this.lifetimeRenown)}`,
                `${Colors.GRAY}Renown Shop Completion: ${Colors.GREEN}${textHelpers.formatNumber(this.renownShop.length)}/81`
            ]
            const off = new Item(`${Colors.RED}Offensive Stats`, offlore, 267);
            const def = new Item(`${Colors.BLUE}Defensive Stats`, deflore, 307);
            const perf = new Item(`${Colors.YELLOW}Performance Stats`, perflore, 296);
            const perkmys = new Item(`${Colors.GREEN}Perk/Mystic Stats`, perkmyslore, 116);
            const misc = new Item(`${Colors.LIGHT_PURPLE}Miscellaneous Stats`, misclore, 49);
            const farm = new Item(`${Colors.GOLD}Farming Stats`, farmlore, 291);
            const prestige = new Item(`${Colors.AQUA}Prestige Stats`, presstats, 264);
            const inv = [off, def, perf, perkmys, misc, farm, prestige];
            this.inventories.generalStats = inv;
            return inv;
        } else {
            const inv = new Item(`${Colors.DARK_RED}Error`, [`${Colors.RED}Player Does not have any stats!`], 166)
            this.inventories.generalStats = [inv];
            return inv;
        }
    }

    /**
     * Player Trades in the past 24h
     * @type {number}
     */
    get trades() {
        return (this.profile.gold_transactions || [])
            .filter(trade => Date.now() - trade.timestamp < 86400e3);
    }

    /**
     * Player's ingame color formatted name without prefix
     * @type {string}
     */
    get colouredName() {
        return this.prefix.substring(0, 2) + this.name;
    }

    /**
     * Takes byte array and returns a promise for its decoded contents
     * @param {Buffer} byteArr 
     * @returns {Promise<any[]>} data that can be passed to Item.buildFromNBT
     */
    parseInv(byteArr) {
        return new Promise(resolve => nbt.parse(inflate(byteArr), (err, inv) => {
            if (err) return resolve([]);
            else {
                let items = inv.value.i.value.value;
                items.forEach(this.logMystic.bind(this));
                return resolve(items);
            }
        }));
    }

    /**
     * player's doc like on the db
     */
    createPlayerDoc() {
        const player = new Player({
            _id: this.uuid,
            name: this.name,
            nameLower: this.name.toLowerCase(),
            colouredName: this.colouredName,
            formattedLevel: this.formattedLevel,
            formattedRank: this.prefix,
            rank: this.rank,
            kills: this.kills,
            assists: this.assists,
            damageDealt: this.damageDealt,
            damageReceived: this.damageReceived,
            damageRatio: this.damageRatio,
            highestStreak: this.highestStreak,
            deaths: this.deaths,
            kdr: this.killDeathRatio,
            xp: this.xp,
            gold: this.currentGold,
            lifetimeGold: this.lifetimeGold,
            playtime: this.playtime,
            contracts: this.contractsCompleted,
            gapples: this.gapplesEaten,
            gheads: this.gheadsEaten,
            lavaBuckets: this.lavaBucketsPlaced,
            soups: this.soupsDrank,
            tierOnes: this.mysticsEnchanted[0],
            tierTwos: this.mysticsEnchanted[1],
            tierThrees: this.mysticsEnchanted[2],
            darkPants: this.darkPantsCreated,
            darkPantsT2: this.darkPantsT2,
            leftClicks: this.leftClicks,
            chatMessages: this.chatMessages,
            wheatFarmed: this.wheatFarmed,
            fishedAnything: this.fishedAnything,
            blocksBroken: this.blocksBroken,
            blocksPlaced: this.blocksPlaced,
            kingsQuests: this.kingsQuestCompletions,
            sewerTreasures: this.sewerTreasuresFound,
            nightQuests: this.nightQuestsCompleted,
            renown: this.renown,
            lifetimeRenown: this.lifetimeRenown,
            arrowShots: this.arrowsFired,
            arrowHits: this.arrowHits,
            bowAccuracy: this.bowAccuracy,
            swordHits: this.swordHits,
            meleeDamageDealt: this.meleeDamageDealt,
            meleeDamageReceived: this.meleeDamageReceived,
            meleeDamageRatio: this.meleeDamageRatio,
            bowDamageDealt: this.bowDamageDealt,
            bowDamageReceived: this.bowDamageReceived,
            bowDamageRatio: this.bowDamageRatio,
            allegiance: this.allegiance,
            diamondItemsPurchased: this.diamondItemsPurchased,
            fishedFish: this.fishedFish,
            hiddenJewelsTriggered: this.hiddenJewelsTriggered,
            xpHourly: this.xpHourly,
            killsHourly: this.killsHourly,
            goldHourly: this.goldHourly,
            fishingRodCasts: this.fishingRodCasts,
            hatColor: this.hatColor,
            kadr: this.killAssistDeathRatio,
            killAssistHourly: this.killAssistHourly,
            contractsStarted: this.contractsStarted,
            contractsRatio: this.contractsRatio,
            jumpsIntoPit: this.jumpsIntoPit,
            launcherLaunches: this.launcherLaunches,
            totalJumps: (this.jumpsIntoPit||0)+(this.launcherLaunches||0),
            bounty: this.bounty,
            genesisPoints: this.allegiancePoints,
            joins: this.joins,
            enderchestOpened: this.enderchestOpened,
            lastinpit: new Date(this.lastSave),
            discord: this.discord
        });
        return player;
    }

    /**
     * Updates the item info in the MongoDB
     * @param {Object} item nbt
     */
    logMystic(item) {
        const attributes = getRef(item, "tag", "value", "ExtraAttributes", "value");
        const rawEnchants = getRef(attributes, "CustomEnchants", "value", "value");
        if (rawEnchants && getRef(attributes, "UpgradeTier", "value") === 3) {
            const enchants = rawEnchants.map(ench => ({
                key: ench.Key.value,
                level: ench.Level.value
            }));
            let flags = [];
            const rareCount = enchants.filter(({ key }) => Mystics[key].Name.includes('RARE')).length;
            if (rareCount >= 1) flags.push('rare');
            if (rareCount >= 2) flags.push('extraordinary');
            if (rareCount >= 3) flags.push('unthinkable');
            const resourceCount = enchants.filter(({ key }) => Mystics[key].Classes.includes("resource")).length;
            if (resourceCount === 3) flags.push('bountiful');
            const comboCount = enchants.filter(({ key }) => Mystics[key].Classes.includes("combo")).length;
            if (comboCount === 3) flags.push('combolicious');
            const tokenCount = enchants.reduce((acc, { level }) => acc + level, 0);
            if (tokenCount >= 8) flags.push('legendary');
            const nonce = getRef(attributes, "Nonce", "value");
            const id = getRef(item, "id", "value");
            let meta = getRef(item, 'Damage', 'value') || getRef(item, "tag", "value", "display", "value", "color", "value");
            if (id >= 298 && id <= 301 && typeof meta === 'undefined') meta = 10511680;
            const maxLives = getRef(attributes, "MaxLives", "value");
            if (maxLives === 100) flags.push('artifact');
            const lives = getRef(attributes, "Lives", "value");
            if (flags.includes('artifact') && flags.includes('extraordinary')) flags.push('miraculous');
            if (flags.includes('artifact') && flags.includes('unthinkable')) flags.push('million');
            if (flags.includes('artifact') && tokenCount >= 7) flags.push('overpowered');
            const mystic = {
                owner: this.uuid,
                enchants,
                nonce,
                lives,
                maxLives,
                item: {
                    id,
                    meta,
                    name: getRef(item, 'tag', 'value', 'display', 'value', 'Name', 'value')
                },
                flags,
                tokens: tokenCount,
                lastseen: Date.now()
            };
            return Mystic.findOneAndUpdate({ nonce, enchants, maxLives }, mystic, { upsert: true }).catch(console.error);
        }
    }
} module.exports = Pit;