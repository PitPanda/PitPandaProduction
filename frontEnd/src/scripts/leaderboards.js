import { minutesToString } from './frontendTools';
 
function toString(n) {
    return toFixed(0)(n);
}

function toFixed(places) {
    return (n) => {
        if (typeof n === 'number') return n.toLocaleString('en-US', {
            minimumFractionDigits: places,
            maximumFractionDigits: places,
        });
        else return n + '';
    }
}

function toPercent(num) {
    return toFixed(1)(num * 100) + '%';
}

const boards = new Proxy({
    kills: {
        displayName: "Top Kills",
        short: "Kills"
    },
    assists: {
        displayName: "Top Assists",
        short: "Assists"
    },
    damageDealt: {
        displayName: "Top Damage Dealt",
        short: "Damage Dealt"
    },
    damageReceived: {
        displayName: "Top Damage Received",
        short: "Damage Received"
    },
    damageRatio: {
        displayName: "Top Damage Ratio",
        short: "Damage Ratio",
        transform: toFixed(2),
        hidden: true
    },
    highestStreak: {
        displayName: "Longest Streaks",
        short: "Max Streak"
    },
    deaths: {
        displayName: "Top Deaths",
        short: "Deaths"
    },
    kdr: {
        displayName: "Top Kill Death Ratio",
        short: "Kill Death Ratio",
        transform: toFixed(2),
        hidden: true
    },
    xp: {
        displayName: "Top Total XP",
        short: "Total XP"
    },
    gold: {
        displayName: "Top Current Gold",
        short: "Current Gold"
    },
    lifetimeGold: {
        displayName: "Top Lifetime Gold Grinded",
        short: "Lifetime Gold"
    },
    playtime: {
        displayName: "Top Playtime",
        short: "Playtime",
        transform: minutesToString
    },
    contracts: {
        displayName: "Top Contracts Completed",
        short: "Contracts Completed"
    },
    gapples: {
        displayName: "Top Golden Apples Eaten",
        short: "Golden Apples"
    },
    gheads: {
        displayName: "Top Golden Heads Eaten",
        short: "Golden Heads"
    },
    lavaBuckets: {
        displayName: "Top Lava Buckets Emptied",
        short: "Lava Buckets Emptied"
    },
    soups: {
        displayName: "Top Soups Drank",
        short: "Soups Drank"
    },
    tierOnes: {
        displayName: "Top Tier 1 Mystics Enchanted",
        short: "Tier 1 Mystics Enchanted",
        hidden: true
    },
    tierTwos: {
        displayName: "Top Tier 2 Mystics Enchanted",
        short: "Tier 2 Mystics Enchanted",
        hidden: true
    },
    tierThrees: {
        displayName: "Top Tier 3 Mystics Enchanted",
        short: "Mystics Enchanted"
    },
    darkPants: {
        displayName: "Top Dark Pants Created",
        short: "Dark Pants Created"
    },
    darkPantsT2: {
        displayName: "Top Dark Pants Created",
        short: "Dark Pants Created",
        hidden: true
    },
    leftClicks: {
        displayName: "Top Left Clicks",
        short: "Left Clicks"
    },
    chatMessages: {
        displayName: "Top Chat Messages",
        short: "Chat Messages"
    },
    wheatFarmed: {
        displayName: "Top Wheat Farmed",
        short: "Wheat Farmed"
    },
    fishedAnything: {
        displayName: "Top Fished Anything",
        short: "Fished Anything"
    },
    blocksBroken: {
        displayName: "Top Blocks Broken",
        short: "Blocks Broken"
    },
    blocksPlaced: {
        displayName: "Top Blocks Placed",
        short: "Blocks Placed"
    },
    kingsQuests: {
        displayName: "Top Kings Quest Completions",
        short: "Kings Quest"
    },
    sewerTreasures: {
        displayName: "Top Sewer Treasures Found",
        short: "Sewer Treasures"
    },
    nightQuests: {
        displayName: "Top Night Quests Completed",
        short: "Night Quests"
    },
    renown: {
        displayName: "Top Current Renown",
        short: "Current Renown"
    },
    lifetimeRenown: {
        displayName: "Top Lifetime Renown Earned",
        short: "Lifetime Renown"
    },
    arrowShots: {
        displayName: "Top Arrows Shot",
        short: "Arrows Shot"
    },
    arrowHits: {
        displayName: "Top Arrow Hits",
        short: "Arrow Hits"
    },
    jumpsIntoPit: {
        displayName: "Top Jumps into Mid",
        short: "Jumps into Mid"
    },
    launcherLaunches: {
        displayName: "Top Launcher Launches",
        short: "Launcher Launches"
    },
    totalJumps: {
        displayName: "Top Entered Pit",
        short: "Entered Pit",
        hidden: true
    },
    bounty: {
        displayName: "Top Bounties",
        short: "Bounty",
        hidden: true
    },
    genesisPoints: {
        displayName: "Top Genesis Points",
        short: "Genesis Points",
        hidden: true
    },
    joins: {
        displayName: "Top Joins to Pit",
        short: "Joins",
        hidden: true
    },
    enderchestOpened: {
        displayName: "Top Enderchests Opened",
        short: "Enderchests Opened"
    },
    bowAccuracy: {
        displayName: "Top Bow Accuracy",
        short: "Bow Accuracy",
        hidden: true,
        transform: toPercent
    },
    swordHits: {
        displayName: "Top Sword Hits",
        short: "Enderchests Opened",
        hidden: true
    },
    meleeDamageDealt: {
        displayName: "Top Melee Damage Dealt",
        short: "Melee Damage Dealt",
        hidden: true
    },
    meleeDamageReceived: {
        displayName: "Top Melee Damage Received",
        short: "Melee Damage Received",
        hidden: true
    },
    meleeDamageRatio: {
        displayName: "Top Melee Damage Ratio",
        short: "Melee Damage Ratio",
        hidden: true,
        transform: toFixed(2)
    },
    bowDamageDealt: {
        displayName: "Top Bow Damage Dealt",
        short: "Bow Damage Dealt",
        hidden: true
    },
    bowDamageReceived: {
        displayName: "Top Bow Damage Received",
        short: "Bow Damage Dealt",
        hidden: true
    },
    bowDamageRatio: {
        displayName: "Top Bow Damage Ratio",
        short: "Bow Damage Ratio",
        hidden: true,
        transform: toFixed(2)
    },
    diamondItemsPurchased: {
        displayName: "Top Diamond Items Purchased",
        short: "Diamond Items Purchased"
    },
    fishedFish: {
        displayName: "Top Fishes Fished",
        short: "Fished Fish"
    },
    hiddenJewelsTriggered: {
        displayName: "Top Hidden Jewels Triggered",
        short: "Hidden Jewels Triggered"
    },
    xpHourly: {
        displayName: "Top XP Per Hour",
        short: "XP/Hour",
        hidden: true
    },
    goldHourly: {
        displayName: "Top Gold Per Hour",
        short: "Gold/Hour",
        hidden: true
    },
    fishingRodCasts: {
        displayName: "Top Fishing Rod Casts",
        short: "Fishing Rod Casts"
    },
    kadr: {
        displayName: "Top Kills + Assists / Death Ratio",
        short: "KADR",
        hidden: true
    },
    killAssistHourly: {
        displayName: "Top Kills + Assists per Hour",
        short: "Kills + Assists per Hour",
        hidden: true
    },
    killsHourly: {
        displayName: "Top Kills per Hour",
        short: "Kills per Hour",
        hidden: true
    },
    contractsStarted: {
        displayName: "Top Contracts Started",
        short: "Contracts Started",
        hidden: true
    },
    contractsRatio: {
        displayName: "Top Contracts Success Rate",
        short: "Contract Success Rate",
        hidden: true,
        transform: toPercent
    },
    bountiesClaimed: {
        displayName: "Top Bounties of 500g+ Claimed with Bounty Hunter",
        short: "Bounties Claimed",
    },
    ragePotatoesEaten: {
        displayName: "Top Rage Potatoes Eaten",
        short: "Rage Potatoes Eaten",
    },
    obsidianBroken: {
        display: "Top Obsidian Broken",
        short: "Obsidian Broken",
    },
    ingotsGold: {
        display: "Top Gold Earned by Ingots",
        short: "Gold Earned by Ingots",
        hidden: true,
    },
    ingotsPickedUp: {
        display: "Top Ingots Picked Up",
        short: "Ingots Gathered",
    },
    vampireHealedHp: {
        display: "Top HP Healed with Vampire",
        short: "Vampire Healing",
    },
    error: {
        displayName: "Invalid Leaderboard",
        short: "Error",
        hidden: true
    },
    default: {
        displayName: "Leaderboard Name",
        short: "Category",
        transform: toString,
        hidden: true
    }
}, {
    get: (target, prop) => {
        if (!(prop in target)) prop = 'error';
        return new Proxy(target[prop], {
            get: (subTarget, subProp) => {
                if (subProp in subTarget) return subTarget[subProp];
                else return target.default[subProp];
            }
        });
    },
    ownKeys: (target) => {
        return Object.entries(target)
            .filter(([, { hidden }]) => !hidden)
            .sort((a, b) => a[1].short < b[1].short ? -1 : 1)
            .map(e => e[0]);
    }
});

export default boards;