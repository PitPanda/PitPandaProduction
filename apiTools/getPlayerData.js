const hypixelAPI = require('./playerRequest');
const { cleanDoc, getDisplays } = require('./apiTools');

async function getPlayerData(tag) {
    const target = await hypixelAPI.player(tag);

    if (target.error) return { success: false, error: target.error };

    const [, displayResults] = await Promise.all([
        target.loadInventorys(),
        getDisplays(target.uuid)
    ]);

    const data = {};

    data.displays = displayResults.displays;
    data.uuid = target.uuid;
    data.name = target.name;
    data.bounty = target.bounty;
    data.online = target.online;
    data.lastSave = target.lastSave;
    data.lastLogout = target.lastLogout;
    data.formattedName = target.formattedName;
    data.formattedLevel = target.formattedLevel;
    data.currentGold = target.currentGold;
    data.playtime = target.playtime;
    data.inventories = target.inventories;
    data.prestiges = target.prestiges;
    data.xpProgress = target.xpProgress;
    data.goldProgress = target.goldProgress;
    data.renownProgress = target.renownProgress;
    data.doc = cleanDoc(displayResults.self || await target.playerDoc);

    return { success: true, data };
}

module.exports = getPlayerData;
