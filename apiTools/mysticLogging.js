const Pit = require("../structures/Pit");
const Mystic = require("../models/Mystic");
const { getRef } = require('../apiTools/apiTools');
const { Pit: { Mystics }} = require('../frontEnd/src/pitMaster.json');
const EventEmitter = require('events');
const e = require("express");
const { update, find } = require("../models/Mystic");

const emitter = new EventEmitter();

const prepareItem = (owner, item) => {
    const attributes = getRef(item, "tag", "value", "ExtraAttributes", "value");
    const bundleContents = getRef(attributes,'bundle_contents','value','value');
    if(bundleContents){
        return bundleContents.map(p => ({
            owner: owner.uuid,
            enchants: [],
            nonce: p.nonce.value,
            lives: 1,
            maxLives: 1,
            item: {
                id: 300,
                meta: 0,
                name: `Pant Bundle Sub-Item`
            },
            flags: [],
            tier: 0,
            tokens: 0,
            owners: [{uuid:owner.uuid,time: Date.now()}],
            lastseen: new Date(),
            lastseenOffline: new Date(owner.lastSave),
        }));
    }
    const nonce = getRef(attributes, "Nonce", "value");
    if(!nonce || (nonce > 0 && nonce < 16)) return []; 
    const rawEnchants = getRef(attributes, "CustomEnchants", "value", "value") || [];
    //console.log(JSON.stringify(item,null,2))
    const tier = getRef(attributes, "UpgradeTier", "value");
    const enchants = rawEnchants.map(ench => ({
        key: ench.Key.value,
        level: ench.Level.value
    }));
    let flags = [];
    if(item.tag.value.ExtraAttributes.value.UpgradeGemsUses) flags.push('gemmed');
    const rareCount = enchants.filter(({ key }, i) => {
        //console.log(`"${key}"`, Mystics[key])
        try{
            return Mystics[key].Name.includes('RARE')
        }catch(e){
            console.log(key);
            console.log(rawEnchants[i], item.tag.value.display.value.Lore.value.value)
            return false;
        }
        
    }).length;
    if (rareCount >= 1) flags.push('rare');
    if (rareCount >= 2) flags.push('extraordinary');
    if (rareCount >= 3) flags.push('unthinkable');
    const resourceCount = enchants.filter(({ key }) => Mystics[key].Classes.includes("resource")).length;
    if (resourceCount === 3) flags.push('bountiful');
    const comboCount = enchants.filter(({ key }) => Mystics[key].Classes.includes("combo")).length;
    if (comboCount === 3) flags.push('combolicious');
    const tokens = enchants.reduce((acc, { level }) => acc + level, 0);
    if (tokens >= 8) flags.push('legendary');
    
    const id = getRef(item, "id", "value");
    let meta = getRef(item, 'Damage', 'value') || getRef(item, "tag", "value", "display", "value", "color", "value");
    if (id >= 298 && id <= 301 && typeof meta === 'undefined') meta = 10511680;
    meta = meta || 0;
    const maxLives = getRef(attributes, "MaxLives", "value");
    if (maxLives === 100) flags.push('artifact');
    const lives = getRef(attributes, "Lives", "value");
    if (flags.includes('artifact') && flags.includes('extraordinary')) flags.push('miraculous');
    if (flags.includes('artifact') && flags.includes('unthinkable')) flags.push('million');
    if (flags.includes('artifact') && tokens >= 7) flags.push('overpowered');
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
        tier,
        tokens,
        owners: [{uuid:owner.uuid,time: Date.now()}],
        lastseen: new Date(owner.lastSave),
        lastseenOffline: new Date(),
    };
    return [mystic];
}

/**
 * Updates the item info in the MongoDB
 * @param {Pit} owner
 * @param {Object[]} items nbt
 */
const logMystics = async (owner, items) => {
    //console.log('source',items)
    const docs = items.map(item => prepareItem(owner, item)).reduce((acc, cur) => acc.concat(cur), []);
    
    //console.log(docs)
    const matches = await Mystic.find({nonce: {'$in':docs.map(d => d.nonce)}});
    const assigned = new Map();
    matches.forEach(m => {
        if(!assigned.has(m.nonce)) assigned.set(m.nonce, []);
        assigned.get(m.nonce).push(m);
    });
    const bulk = Mystic.collection.initializeUnorderedBulkOp();
    const emitQueue = [];
    let index = 0;
    outer:
    for(const mystic of docs){
        const dups = assigned.get(mystic.nonce) || [];
        const gemmed = mystic.flags.includes('gemmed') ? ['gemmed'] : [];

        const updateOwner = async (old, rest) => {
            const prev = old.owners[old.owners.length-1];
            if(prev.uuid !== owner.uuid || old.lastseenOffline + 86400e3 < Date.now()){
                if(!rest) rest = {};
                rest.lastseen = mystic.lastseen;
                rest.lastseenOffline = mystic.lastseenOffline;
            }
            if(prev.uuid === owner.uuid){
                if(rest) {
                    bulk.find({_id:old._id}).updateOne({'$set':rest});
                    index++
                }
                // else do nothing
            } else {
                bulk.find({_id:old._id}).updateOne({
                    '$push': {owners:mystic.owners[0]},
                    '$set': {
                        owner: owner.uuid,
                        ...(rest || {})
                    },
                })
                index++;
            }
        }

        const updateItem = async old => {
            const updates = {
                enchants: mystic.enchants,
                lives: mystic.lives,
                maxLives: mystic.maxLives,
                item: mystic.item,
                flags: mystic.flags,
                tier: mystic.tier,
                tokens: mystic.tokens,
            };
            if(mystic.tier>0 && mystic.tier !== old.tier && !mystic.flags.includes('gemmed')) updates[`t${mystic.tier}`] = mystic.enchants;
            updateOwner(old, updates);
        }

        // this should handle deleting 
        dups_loop:
        for(const m of dups){
            if(m.tier === mystic.tier){
                if(m.enchants.length !== mystic.enchants.length) continue;
                let delta = 0;
                for(let i = 0; i < m.enchants.length; i++){
                    if(m.enchants[i].key !== mystic.enchants[i].key) continue dups_loop;
                    delta += mystic.enchants[i].level - m.enchants[i].level;
                }
                if(delta === 0) { //no change, so check for owner change 
                    updateOwner(m);
                    continue outer;
                }
                if(delta === 1 && !m.flags.includes('gemmed') && mystic.flags.includes('gemmed')){ // item was gemmed
                    await updateItem(m);
                    emitQueue.push({events:[`t${mystic.tier}`, 'gemmed'],index: index-1,item:mystic});
                    continue outer;
                }
                // if reach here -> item is duped t3 with totally diff enchants woah
            }else if(m.tier < mystic.tier){
                // could this mystic be made from the previous
                if(mystic.maxLives >= m.maxLives && m.enchants.every(e1=>mystic.enchants.some(e2=>e1.key === e2.key && e1.level <= e2.level))) {
                    await updateItem(m);
                    emitQueue.push({events:[`t${mystic.tier}`, ...gemmed],index: index-1,item:mystic});
                    continue outer;
                }
            }
        }
        //if we reached here this is a new item

        if(mystic.tier>0 && !mystic.flags.includes('gemmed')) updates[`t${mystic.tier}`] = mystic.enchants;
        bulk.insert(mystic);
        index++;
        emitQueue.push({events:['new',`t${mystic.tier}`, ...gemmed],index:index-1,item:mystic});
    }
    //console.log(bulk.s.currentBatch.operations)
    if(getRef(bulk, 's', 'currentBatch', 'operations', 'length')){
        const { result } = await bulk.execute();
        const ids = result.insertedIds.map(i=>i._id);
        emitQueue.forEach(e => {
            e.item._id = ids[e.index];
            emitter.emit('mystic', {tags: e.events, item: e.item});
        })
    }
    
}

module.exports = {
    logMystics: logMystics,
    events: emitter,
}
