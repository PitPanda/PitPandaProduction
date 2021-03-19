const { Pit: { Upgrades, RenownUpgrades, Perks, Mystics }, Extra: { ColorCodes: Colors } } = require('../PitPandaFrontend/src/pitMaster.json');
const mcitems = require('../minecraftItems.json');
const Player = require('../models/Player');
const textHelpers = require('../utils/TextHelpers');
const redis = new (require('../utils/RedisClient'))(0);

/**
 * Generates a function to send to router to display a given error message
 * @param {string} message Error message
 * @returns {Function}
 */
function APIerror(message) {
    const json = { success: false, error: message };
    const errorFn = ((req, res) => res.status(404).json(json));
    errorFn.toString = () => { error: message };
    errorFn.json = json;
    return errorFn;
}

/**
 * Gets properties for an object and returns undefined if
 * it does not exist instead of erroring
 * @param {Object} object object to grab property from
 * @param  {...string} path path to get
 * @returns the value at the path from the object
 */
const getRef = (object, ...path) => {
    if (!object) return undefined;
    if (path.length == 1) return object[path[0]];
    else return getRef(object[path.shift()], ...path)
}

/**
 * 
 * @param {string | object} target key or upgrade object to check
 */
const isTiered = target => {
    if (typeof target === 'string') target = Upgrades[target] || RenownUpgrades[target] || Perks[target];
    return (
        (target.Levels || []).length > 1 ||
        getRef(target, 'Extra', 'Formatting') == "Seperated" ||
        getRef(target, 'Extra', 'Formatting') == "Reveal"
    )
}

/**
 * takes item id and meta and returns it item name
 * @param {number} id 
 * @param {number} meta 
 * @returns {string}
 */
const getItemNameFromId = (id, meta) => {
    const firstcheck = mcitems.filter(item => item.type == id);
    if (firstcheck.length == 0) return;
    const secondcheck = firstcheck.find(item => item.meta == meta);
    return (secondcheck || firstcheck[0]).name;
}

/**
 * @param {object} upgrade pitMaster upgrade data
 * @param {number} tier 
 * @param {object} api raw output
 */
const subDescription = (upgrade, tier, api) => {
    upgrade = JSON.parse(JSON.stringify(upgrade));
    const format = getRef(upgrade, 'Extra', 'Formatting');
    tier = Math.max(tier, 0);
    if (format == "Reveal") {
        upgrade.Description = upgrade.Description.slice(0, 1 + tier + upgrade.Extra.IgnoreIndex);
    } else if (format == "Seperated") {
        upgrade.Description = upgrade.Description[tier];
    } else if (format == "ApiReference") {
        let data = getRef(api, ...upgrade.Extra.Ref.slice(1));
        if (upgrade.Extra.Function == 'toHex') data = textHelpers.toHex(data);
        upgrade.Description = upgrade.Description.map(line => line.replace(RegExp('\\$','g'), data));
        upgrade.Item.Meta = upgrade.Item.Meta.replace('$', data);
    } else {
        upgrade.Description = upgrade.Description.map(line => line.replace('$', upgrade.Levels[tier]));
    }
    return upgrade;
}

const Item = require('../structures/Item');
const { hydrate } = require('../models/Player');
/**
 * converts document to item
 * @param {Document} doc 
 * @returns {{owner:String,lastseen:Number,item:Item,id:string}}
 */
const dbToItem = doc => {
    return {
        owner: doc.owner,
        lastseen: Math.floor(doc.lastseen / 1e3),
        id: doc._id,
        nonce: doc.nonce,
        item: new Item(
            doc.item.name,
            [`${Colors.GRAY}Lives: ${doc.lives > 3 ? Colors.GREEN : Colors.RED}${doc.lives}${Colors.GRAY}/${doc.maxLives}${doc.flags.includes('gemmed') ? ` ${Colors.GREEN}♦` : ''}`, ...doc.enchants.map(({ key, level }) => [
                '',
                Mystics[key].Name + ' ' + ((level > 1) ? textHelpers.romanNumGen(level) : ''),
                ...Mystics[key].Descriptions[Math.min(level - 1, Mystics[key].Descriptions.length - 1)]
            ]).flat(1)],
            doc.item.id,
            (typeof doc.item.meta !== 'undefined') ? textHelpers.toHex(doc.item.meta) : undefined,
            1
        )
    };
}

const cleanDoc = doc => {
    const newDoc = doc.toJSON();
    if(newDoc.flag) {
        const { addedby, timestamp, evidence, ...clean } = newDoc.flag;
        newDoc.flag = clean;
    }
    return newDoc;
}

const getDisplays = async uuid => {
    const players = await Player.find(
        {
            $or:[
                {
                    'flag.alts':{
                        $elemMatch:{
                            $eq: uuid,
                        },
                    },
                },
                {
                    'profileDisplay.alts':{
                        $elemMatch:{
                            $eq: uuid,
                        },
                    },
                },
                {
                    '_id': uuid,
                },
            ],
        }
    );

    const displays = [];

    const self = players.find(d=>d._id === uuid);
    if (self) {
        if(self.profileDisplay) displays.push({
            ...self.toJSON().profileDisplay,
            display_type: 'plaque',
        });
        if(self.flag) displays.push({
            ...self.toJSON().flag,
            addedby: undefined,
            timestamp: undefined,
            evidence: undefined,
            display_type: 'flag',
        });
    }
    players.filter(d=>d._id !== uuid).map(notSelf => {
        if(notSelf.profileDisplay && notSelf.profileDisplay.alts && notSelf.profileDisplay.alts.includes(uuid)) displays.push({
            ...notSelf.toJSON().profileDisplay, 
            alts: undefined, 
            main: notSelf._id,
            display_type: 'plaque',
        });
        if(notSelf.flag && notSelf.flag.alts && notSelf.flag.alts.includes(uuid)) displays.push({
            ...notSelf.toJSON().flag,
            addedby: undefined,
            timestamp: undefined,
            evidence: undefined,
            alts: undefined,
            main: notSelf._id,
            display_type: 'flag',
        });
    });

    return {
        self,
        displays,
    }
}

const invalidateKey = key => {
    redis.client.hgetall(`apikey:${key}`, (err, reply) => {
        if(err || !reply || Object.keys(reply).length < 1) return;
        redis.client.set(`cd:${reply.owner}`, 'true', 'EX', 900);
    })
}

module.exports = { dbToItem, getItemNameFromId, isTiered, APIerror, getRef, subDescription, cleanDoc, getDisplays, invalidateKey };
