const Pit = require("../structures/Pit");
const Mystic = require("../models/Mystic");
const { getRef } = require('../apiTools/apiTools');
const { Pit: { Mystics }} = require('../frontEnd/src/pitMaster.json');
const EventEmitter = require('events');

const emitter = new EventEmitter();

/**
 * Updates the item info in the MongoDB
 * @param {Pit} owner
 * @param {Object} item nbt
 */
const logMystic = async(owner, item) => {
    const attributes = getRef(item, "tag", "value", "ExtraAttributes", "value");
    const rawEnchants = getRef(attributes, "CustomEnchants", "value", "value");
    if (rawEnchants && getRef(attributes, "UpgradeTier", "value") === 3) {
        const enchants = rawEnchants.map(ench => ({
            key: ench.Key.value,
            level: ench.Level.value
        }));
        let flags = [];
        if(item.tag.value.ExtraAttributes.value.UpgradeGemsUses) flags.push('gemmed');
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
            owner: owner.uuid,
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
            lastseen: new Date(owner.lastSave),
        };
        try{
            const res = await Mystic.findOneAndUpdate(
                { nonce, enchants, maxLives },
                mystic,
                {
                    upsert: true,
                    rawResult: true,
                }
            )
            if(!res.lastErrorObject.updatedExisting) emitter.emit('new', res.value);
        }catch(e){
            console.error(e)
        }
    }
}

module.exports = {
    logMystic,
    events: emitter,
}
