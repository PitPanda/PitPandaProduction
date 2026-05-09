const fetch = require('node-fetch');
const WipeDetection = require('../models/WipeDetection');

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1502702864219373578/RBJ3n1SZwBaZJQHHeEywfDUN7cVPi-8yy8WgJkuIsfe0kuYv8E8ASItoDiLRxs_S-po8';

// Wipe: player had meaningful progress and it all reset to zero
const isWipe = (oldPrestige, oldPlaytime, newPrestige, newPlaytime, newXp) => {
    const hadProgress = oldPrestige > 0 || oldPlaytime > 120;
    const totalReset = newPrestige === 0 && newPlaytime === 0 && newXp === 0;
    const prestigeReset = oldPrestige > 1 && newPrestige === 0;
    return hadProgress && (totalReset || prestigeReset);
};

const sendWipeWebhook = (wipeDoc) => {
    const embed = {
        title: 'Wipe Detected',
        color: 0xff4444,
        fields: [
            { name: 'Player', value: wipeDoc.name || wipeDoc.uuid, inline: true },
            { name: 'UUID', value: `\`${wipeDoc.uuid}\``, inline: true },
            { name: '​', value: '​', inline: true },
            {
                name: 'Before',
                value: `Prestige: **${wipeDoc.before.prestige}**\nPlaytime: **${wipeDoc.before.playtime}m**\nXP: **${wipeDoc.before.xp}**`,
                inline: true,
            },
            {
                name: 'After',
                value: `Prestige: **${wipeDoc.after.prestige}**\nPlaytime: **${wipeDoc.after.playtime}m**\nXP: **${wipeDoc.after.xp}**`,
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'PitPanda Wipe Detection' },
    };
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
    }).catch(err => console.error('Wipe webhook failed:', err));
};

/**
 * Called after a player doc is saved. Compares old DB doc with fresh Hypixel data.
 * @param {string} uuid
 * @param {string} name
 * @param {object|null} oldDoc - previous player document (lean)
 * @param {number} newPrestige
 * @param {number} newPlaytime
 * @param {number} newXp
 * @param {number} newLifetimeGold
 */
const checkForWipe = async (uuid, name, oldDoc, newPrestige, newPlaytime, newXp, newLifetimeGold) => {
    if (!oldDoc) return;

    const oldPrestige = (oldDoc.prestigeTimes || []).length;
    const oldPlaytime = oldDoc.playtime || 0;

    if (!isWipe(oldPrestige, oldPlaytime, newPrestige, newPlaytime, newXp)) return;

    // Avoid duplicate wipe entries within 1 hour
    const recent = await WipeDetection.findOne({
        uuid,
        detectedAt: { $gte: new Date(Date.now() - 3600e3) },
    }).lean();
    if (recent) return;

    const wipeDoc = await WipeDetection.create({
        uuid,
        name,
        before: {
            prestige: oldPrestige,
            playtime: oldPlaytime,
            xp: oldDoc.xp || 0,
            lifetimeGold: oldDoc.lifetimeGold || 0,
        },
        after: {
            prestige: newPrestige,
            playtime: newPlaytime,
            xp: newXp,
            lifetimeGold: newLifetimeGold,
        },
    }).catch(err => { console.error('Failed to save wipe detection:', err); return null; });

    if (wipeDoc) sendWipeWebhook(wipeDoc);
};

module.exports = { checkForWipe };
