const express = require('express')
const request = require('request');
const fs = require('fs');
const nbt = require('nbt');
const app = express();
const port = 80;
const { inflate } = require('pako');

class api{
    constructor(keys){
        this.keys = keys;
        this.i = 0;
    }
    getUserByUnknown(tag, callback){
        if(tag.length<32){
            return this.getUserByName(tag);
        }else{
            return this.getUserByUUID(tag);
        }
    }
    getUserByName(name){
        return Promise.race([new Promise((resolve,reject)=>{
            request(`https://api.hypixel.net/player?key=${this.getKey()}&name=${name}`, (err, apiResCode, body)=>resolve({err:err,apiResCode:apiResCode,body:body}));
        }),new Promise((resolve,reject)=>{
            setTimeout(()=>resolve(),6000);
        })]);
    }
    getUserByUUID(uuid, callback){
        return Promise.race([new Promise((resolve,reject)=>{
            request(`https://api.hypixel.net/player?key=${this.getKey()}&uuid=${uuid}`, (err, apiResCode, body)=>resolve({err:err,apiResCode:apiResCode,body:body}));
        }),new Promise((resolve,reject)=>{
            setTimeout(()=>resolve(),6000);
        })]);
    }
    getSession(uuid, callback){
        return Promise.race([new Promise((resolve,reject)=>{
            request(`https://api.hypixel.net/session?key=${this.getKey()}&uuid=${uuid}`, (err, apiResCode, body)=>resolve({err:err,apiResCode:apiResCode,body:body}));
        }),new Promise((resolve,reject)=>{
            setTimeout(()=>resolve(),4000);
        })]);
    }
    getKey(){
        this.i=(this.i+1)%this.keys.length;
        return this.keys[this.i];
    }
};

let apiKeys = JSON.parse(String(fs.readFileSync("keys.json")));
let hypixel = new api(apiKeys);

let pitMaster;
let Colors;
fs.readFile('pitMaster.json', (err, data) => {
    if(err) console.log(err);
    else {
        pitMaster = JSON.parse(data);
        Colors = pitMaster.Extra.ColorCodes;
    }
});

let minecraftItems = {};
fs.readFile('minecraftItems.json', (err, data) => {
    if(err) console.log(err);
    else {
        JSON.parse(data).forEach(item =>{
            if(minecraftItems[item.type]){
                if(!Array.isArray(minecraftItems[item.type])) minecraftItems[item.type] = [minecraftItems[item.type]];
                minecraftItems[item.type].push(item.name);
            }else{
                minecraftItems[item.type] = item.name;
            }
        });
    }
})

let minecraftEnchants;
fs.readFile('enchants.json', (err, data) => {
    if(err) console.log(err);
    else minecraftEnchants = JSON.parse(data);
});

let blueprintItem = {};

app.use(express.static('public'));

const apiError = message => ((req,res)=>res.send({success:false,error:message}));

app.get('/api/players/:id', (req, res) => {
    let start = Date.now();
    getPitStats(req.params.id, res).then(out=>{
        res.send(out);
        console.log(`Loaded ${req.params.id} in ${Date.now()-start} ms`);
    });
});
app.get('/api/TradeCenter/DiscordAuth/:id', (req, res) => {
    const identification = req.params.id.replace(/-/g,'');
    hypixel.getUserByUnknown(identification).then(apiCall => {
        if(!apiCall) res.send({success:false,error:'Failed to reach Hypixel API'});
        else if(apiCall.err) res.send({success:false,error:apiCall.err});
        const result = JSON.parse(apiCall.body);
        if(!result.success) resolve({success:false,error:result.cause});
        const discord = getRef(result,'player',"socialMedia","links",'DISCORD');
        const prestige = (getRef(result,'player',"stats","Pit",'profile',"prestiges")||[]).length;
        if(discord){
            res.send({success:true,discord,prestige});
        }else res.send({success:false,error:'User has not set a discord profile'})
    });
});

app.get('/api/players', apiError('No user specified'));
app.get('/api/TradeCenter/DiscordAuth', apiError('No user specified'));
app.get('/api', apiError('Invalid Endpoint'));
app.get('/api/*', apiError('Invalid Endpoint'));

app.get('*', (req,res)=>res.sendFile(__dirname + "/public/index.html"));

const server = app.listen(port, () => console.log(`Pit Panda listening on port ${port}!`));

function getPitStats(tag){
    const identification = tag.replace(/-/g,'');
    return new Promise((resolve,reject)=>{
        hypixel.getUserByUnknown(identification).then(apiCall => {
            if(!apiCall) resolve({success:false,error:"Failed to reach hypixel API"});
            else if(apiCall.err) resolve({success:false,error:apiCall.err});
            else {
                let raw = JSON.parse(apiCall.body);
                if(!raw.success) resolve({success:false,error:raw.cause});
                else if (raw.player==null) resolve({success:false,error:"Couldn't find that player"});
                else if (raw.player.stats && raw.player.stats.Pit){
                    let pending = [];
                    let out = {};
                    out.uuid=raw.player.uuid;
                    out.displayname=raw.player.displayname;
                    let pit = raw.player.stats.Pit;
                    out.stats={};
                    out.formatted={};
                    out.prestiges=[];
                    out.rank = getRef(raw, "player", "PackageRank") || "NON";
                    out.rank = getRef(raw, "player", "newPackageRank") || out.rank;
                    if(getRef(raw, "player", "monthlyPackageRank")=='SUPERSTAR') out.rank = "SUPERSTAR";
                    let staffRank = getRef(raw, "player", "rank");
                    if(staffRank && staffRank!='NORMAL') out.rank = staffRank;
                    let progress = out.progress = {gold:{},xp:{},renown:{goal:1680,current:getShopSpentRenown(pit)}};
                    progress.gold.current = 0;
                    
                    out.stats.xp = 0;
                    out.stats.prestige = 0;
                    out.stats.gold=0;
                    if(pit.profile){//uuid, logout, login, save, recentgame, rank
                        const profile = pit.profile;
                        out.stats.xp = profile.xp || 0;
                        out.stats.gold = profile.cash||0;
                        if(profile.bounties && profile.bounties.length > 0) out.bounty = calcBounty(profile.bounties);
                        if(profile.prestiges) out.stats.prestige = profile.prestiges.length;
                        for(let thing of (profile[`unlocks`]||[])){
                            thing.display = getRef(pitMaster.Pit.Upgrades,thing.key,'Name') || getRef(pitMaster.Pit.Perks,thing.key,'Name') || thing.key;
                        }
                        out.prestiges.push(profile.unlocks||[]);
                        for(let i = 1; i <= out.stats.prestige; i++){
                            if(profile[`unlocks_${i}`]) {
                                for(let thing of profile[`unlocks_${i}`]){
                                    thing.display = getRef(pitMaster.Pit.Upgrades,thing.key,'Name') || getRef(pitMaster.Pit.Perks,thing.key,'Name') || thing.key;
                                }
                                out.prestiges.push(profile[`unlocks_${i}`]);
                            }else out.prestiges.push([]);
                        }
                        out.inventories = {};

                        out.status = checkStatus(raw.player.lastLogout, raw.player.lastLogin, profile.last_save, raw.player.mostRecentGameType, out.rank);
                        
                        pending.push(unpack(profile.inv_contents, "main",9, 36, items => items.slice(9).concat(items.slice(0,9))));
                        pending.push(unpack(profile.inv_armor, "armor", 1, 4, items => items.reverse()));
                        pending.push(unpack(profile.inv_enderchest, "enderchest",9,27));
                        pending.push(unpack(profile.item_stash, "stash", 9, 18));
                        pending.push(unpack(profile.mystic_well_item, "well1", 1, 1));
                        pending.push(unpack(profile.mystic_well_pants, "well2", 1, 1));
    
                        progress.gold.current=Math.round(profile[`cash_during_prestige_${out.stats.prestige}`]||0);
    
                        let perks = [];
                        let perkslots = 3;
                        if((profile.renown_unlocks||[]).some(el=>el.key=="extra_perk_slot")) perkslots=4;
                        for(let i = 0; i<perkslots;i++) {
                            if (profile[`selected_perk_${i}`]){
                                const perk = pitMaster.Pit.Perks[profile[`selected_perk_${i}`]];
                                perks.push(createItem("§9"+perk.Name,perk.Description,perk.Item.Id,perk.Item.Meta,1));
                            }else perks.push(blueprintItem);
                        } out.inventories.perks = formatItemArr(perks,perks.length,perks.length);
    
                        let upgrades = [];
                        const unlocks = profile[`unlocks${(out.stats.prestige)?`_${out.stats.prestige}`:``}`]||[]; 
                        for(upgradeKey in pitMaster.Pit.Upgrades){
                            const tier = unlocks.reduce((acc,upgrade)=>(upgrade.key==upgradeKey&&upgrade.tier>acc)?upgrade.tier:acc,-1);
                            let upgrade = subDescription(pitMaster.Pit.Upgrades[upgradeKey],(tier==-1)?0:tier,raw);
                            upgrades.push(createItem(`${(tier<0)?"§c":"§9"}${upgrade.Name} ${romanNumGen(tier+1)}`,upgrade.Description,upgrade.Item.Id,upgrade.Item.Meta,tier+1));
                        } out.inventories.upgrades = formatItemArr(upgrades,7,7);
    
                        let renownups = [];
                        const renownunlocks = profile.renown_unlocks; 
                        for(upgradeKey in pitMaster.Pit.RenownUpgrades){
                            let tier = (renownunlocks||[]).reduce((acc,upgrade)=>(upgrade.key==upgradeKey&&upgrade.tier>acc)?upgrade.tier:acc,-1);
                            let upgrade = subDescription(pitMaster.Pit.RenownUpgrades[upgradeKey],(tier==-1)?0:tier,raw);
                            renownups.push(createItem(`${(tier<0)?"§c":"§9"}${upgrade.Name} ${((upgrade.Levels||[]).length>1||upgrade.Extra.Formatting=="Seperated"||upgrade.Extra.Formatting=="Reveal")?romanNumGen(tier+1):''}`,upgrade.Description,upgrade.Item.Id,upgrade.Item.Meta,tier+1));
                        } out.inventories.renownshop = formatItemArr(renownups,7,renownups.length);
                    }
    
                    if(pit.pit_stats_ptl){
                        const ptl = pit.pit_stats_ptl;
                        for(const key in ptl)out.stats[key]=ptl[key];
                        let offlore = [
                            `${Colors.GRAY}Kills: ${Colors.GREEN}${(ptl.kills||0).toLocaleString()}`,
                            `${Colors.GRAY}Assists: ${Colors.GREEN}${(ptl.assists||0).toLocaleString()}`,
                            `${Colors.GRAY}Sword Hits: ${Colors.GREEN}${(ptl.sword_hits||0).toLocaleString()}`,
                            `${Colors.GRAY}Arrows Shot: ${Colors.GREEN}${(ptl.arrows_fired||0).toLocaleString()}`,
                            `${Colors.GRAY}Arrows Hit: ${Colors.GREEN}${(ptl.arrow_hits||0).toLocaleString()}`,
                            `${Colors.GRAY}Damage Dealt: ${Colors.GREEN}${(ptl.damage_dealt||0).toLocaleString()}`,
                            `${Colors.GRAY}Melee Damage Dealt: ${Colors.GREEN}${(ptl.melee_damage_dealt||0).toLocaleString()}`,
                            `${Colors.GRAY}Bow Damage Dealt: ${Colors.GREEN}${(ptl.bow_damage_dealt||0).toLocaleString()}`,
                            `${Colors.GRAY}Highest Streak: ${Colors.GREEN}${(ptl.max_streak||0).toLocaleString()}`
                        ];
                        let deflore = [
                            `${Colors.GRAY}Deaths: ${Colors.GREEN}${(ptl.deaths||0).toLocaleString()}`,
                            `${Colors.GRAY}Damage Taken: ${Colors.GREEN}${(ptl.damage_received||0).toLocaleString()}`,
                            `${Colors.GRAY}Melee Damage Taken: ${Colors.GREEN}${(ptl.melee_damage_received||0).toLocaleString()}`,
                            `${Colors.GRAY}Bow Damage Taken: ${Colors.GREEN}${(ptl.bow_damage_received||0).toLocaleString()}`
                        ];
                        let perflore = [
                            `${Colors.GRAY}XP: ${Colors.AQUA}${out.stats.xp.toLocaleString()}`,
                            `${Colors.GRAY}XP/hour: ${Colors.AQUA}${((out.stats.xp||0)/(ptl.playtime_minutes||1)*60).toLocaleString()}`,
                            `${Colors.GRAY}Gold Earned: ${Colors.GOLD}${(ptl.cash_earned||0).toLocaleString()}g`,
                            `${Colors.GRAY}Gold/hour: ${Colors.GOLD}${((ptl.cash_earned||0)/(ptl.playtime_minutes||1)*60).toLocaleString()}g`,
                            `${Colors.GRAY}K/D: ${Colors.GREEN}${((ptl.kills||0)/(ptl.deaths||1)).toLocaleString()}`,
                            `${Colors.GRAY}K+A/D: ${Colors.GREEN}${(((ptl.kills||0)+(ptl.assists||0))/(ptl.deaths||1)).toLocaleString()}`,
                            `${Colors.GRAY}K+A/hour: ${Colors.GREEN}${(((ptl.kills||0)+(ptl.assists||0))/(ptl.playtime_minutes||1)*60).toLocaleString()}`,
                            `${Colors.GRAY}Damage dealt/taken: ${Colors.GREEN}${((ptl.damage_dealt||0)/(ptl.damage_received||1)).toLocaleString()}`,
                            `${Colors.GRAY}Bow Accuracy: ${Colors.GREEN}${Math.round((ptl.arrow_hits||0)*1000/(ptl.arrows_fired||1))/10 + '%'}`,
                            `${Colors.GRAY}Hours played: ${Colors.GREEN}${Math.round((ptl.playtime_minutes||0)/60).toLocaleString()}`,
                            `${Colors.GRAY}Contracts Started: ${Colors.GREEN}${(ptl.contracts_started||0).toLocaleString()}`,
                            `${Colors.GRAY}Contracts Completed: ${Colors.GREEN}${(ptl.contracts_completed||0).toLocaleString()}`
                        ];
                        let perkmyslore = [
                            `${Colors.GRAY}Golden Apples Eaten: ${Colors.GREEN}${(ptl.gapple_eaten||0).toLocaleString()}`,
                            `${Colors.GRAY}Golden Heads Eaten: ${Colors.GREEN}${(ptl.ghead_eaten||0).toLocaleString()}`,
                            `${Colors.GRAY}Lava Buckets Emptied: ${Colors.GREEN}${(ptl.lava_bucket_emptied||0).toLocaleString()}`,
                            `${Colors.GRAY}Fishing Rods Launched: ${Colors.GREEN}${(ptl.fishing_rod_launched||0).toLocaleString()}`,
                            `${Colors.GRAY}Soups Drank: ${Colors.GREEN}${(ptl.soups_drank||0).toLocaleString()}`,
                            `${Colors.GRAY}T1 Mystics Enchanted: ${Colors.GREEN}${(ptl.enchanted_tier1||0).toLocaleString()}`,
                            `${Colors.GRAY}T2 Mystics Enchanted: ${Colors.GREEN}${(ptl.enchanted_tier2||0).toLocaleString()}`,
                            `${Colors.GRAY}T3 Mystics Enchanted: ${Colors.GREEN}${(ptl.enchanted_tier3||0).toLocaleString()}`,
                            `${Colors.GRAY}Dark Pants Created: ${Colors.GREEN}${(ptl.dark_pants_crated||0).toLocaleString()}`
                        ];
                        let misclore = [
                            `${Colors.GRAY}Left Clicks: ${Colors.GREEN}${(ptl.left_clicks||0).toLocaleString()}`,
                            `${Colors.GRAY}Diamond Items Purchased: ${Colors.GREEN}${(ptl.diamond_items_purchased||0).toLocaleString()}`,
                            `${Colors.GRAY}Chat messages: ${Colors.GREEN}${(ptl.chat_messages||0).toLocaleString()}`,
                            `${Colors.GRAY}Blocks Placed: ${Colors.GREEN}${(ptl.blocks_placed||0).toLocaleString()}`,
                            `${Colors.GRAY}Blocks Broken: ${Colors.GREEN}${(ptl.blocks_broken||0).toLocaleString()}`,
                            `${Colors.GRAY}Jumps into Pit: ${Colors.GREEN}${(ptl.jumped_into_pit||0).toLocaleString()}`,
                            `${Colors.GRAY}Launcher Launches: ${Colors.GREEN}${(ptl.launched_by_launchers||0).toLocaleString()}`
                        ];
                        let farmlore = [
                            `${Colors.GRAY}Wheat Farmed: ${Colors.GREEN}${(ptl.wheat_farmed||0).toLocaleString()}`,
                            `${Colors.GRAY}Fished Anything: ${Colors.GREEN}${(ptl.fished_anything||0).toLocaleString()}`,
                            `${Colors.GRAY}Fished Fish: ${Colors.GREEN}${(ptl.fishes_fished||0).toLocaleString()}`,
                            `${Colors.GRAY}Gold From Selling Fish: ${Colors.GOLD}${(ptl.gold_from_selling_fish||0).toLocaleString()}g`,
                            `${Colors.GRAY}Gold From Farming: ${Colors.GOLD}${(ptl.gold_from_farming||0).toLocaleString()}g`,
                            `${Colors.GRAY}King's Quest Completions: ${Colors.GREEN}${(ptl.king_quest_completion||0).toLocaleString()}`,
                            `${Colors.GRAY}Sewer Treasures Found: ${Colors.GREEN}${(ptl.sewer_treasures_found||0).toLocaleString()}`,
                            `${Colors.GRAY}Night Quests Completed: ${Colors.GREEN}${(ptl.night_quests_completed||0).toLocaleString()}`
                        ];
                        let presstats = [
                            `${Colors.GRAY}Prestige: ${Colors.GREEN}${out.stats.prestige}`,
                            `${Colors.GRAY}Current Renown: ${Colors.GREEN}${getRef(pit,'profile','renown') || 0}`,
                            `${Colors.GRAY}Lifetime Renown: ${Colors.GREEN}${getLifeRenown(pit)}`,
                            `${Colors.GRAY}Renown Shop Completion: ${Colors.GREEN}${(getRef(pit,'profile','renown_unlocks')||[]).length}/78`
                        ]
                        let off = createItem(`${Colors.RED}Offensive Stats`,offlore,267,0);
                        let def = createItem(`${Colors.BLUE}Defensive Stats`,deflore,307,0);
                        let perf = createItem(`${Colors.YELLOW}Performance Stats`,perflore,296,0);
                        let perkmys = createItem(`${Colors.GREEN}Perk/Mystic Stats`,perkmyslore,116,0);
                        let misc = createItem(`${Colors.LIGHT_PURPLE}Miscellaneous Stats`,misclore,49,0);
                        let farm = createItem(`${Colors.GOLD}Farming Stats`,farmlore,291,0);
                        let prestige = createItem(`${Colors.AQUA}Prestige Stats`,presstats,264,0);
                        let elms = [off,def,perf,perkmys,misc,farm,prestige];
                        out.inventories.genstats = formatItemArr(elms,elms.length,elms.length);
                    }else out.inventories.genstats = formatItemArr([createItem(`${Colors.DARK_RED}Error`,[`${Colors.RED}Player Does not have any stats!`],166,0)],1,1);
    
                    
                    progress.xp.goal = pitMaster.Pit.Prestiges[out.stats.prestige].TotalXp;
                    progress.xp.current = Math.round(getPresXp(out.stats.xp,out.stats.prestige));
                    progress.xp.per = out.progress.xp.current/out.progress.xp.goal;
                    progress.xp.str = abbrNum(out.progress.xp.current,2) + '/' + abbrNum(out.progress.xp.goal,2);
                    progress.xp.hover = (out.stats.prestige==30&&progress.xp.per==1)?('Max Prestige'):(Math.round(progress.xp.per*1000)/10+'%');

                    progress.gold.goal = pitMaster.Pit.Prestiges[out.stats.prestige].GoldReq;
                    if(progress.gold.goal==0){
                        progress.gold.per = 1;
                        progress.gold.str = abbrNum(out.progress.gold.current,2);
                        progress.gold.hover = 'Max Prestige';
                    }else{
                        progress.gold.per = out.progress.gold.current/out.progress.gold.goal;
                        progress.gold.str = abbrNum(out.progress.gold.current,2) + '/' + abbrNum(out.progress.gold.goal,2);
                        progress.gold.hover = Math.round(progress.gold.per*1000)/10+'%';
                    }

                    progress.renown.per = progress.renown.current/progress.renown.goal;
                    progress.renown.str = `${(getRef(pit,'profile','renown_unlocks')||[]).length}/78`;
                    progress.renown.hover = (progress.renown.per==1)?"Max Shop":(Math.floor(progress.renown.per*1000)/10+'%');
                    
                    
                    
    
                    out.prefix = pitMaster.Extra.RankPrefixes[out.rank];
                    out.prefix = getRef(raw, "player", "prefix") || out.prefix || pitMaster.Extra.RankPrefixes.NON;
                    out.prefix = out.prefix.replace('$',Colors[getRef(raw, "player", "rankPlusColor")]||'§c');
    
                    out.formatted.name=out.prefix+" "+raw.player.displayname;
    
                    out.stats.level = getLevel(out.stats.xp, out.stats.prestige);
    
                    out.formatted.level = levelString(out.stats.prestige,out.stats.level);
    
                    out.formatted.gold = Colors.GOLD+Math.round(out.stats.gold).toLocaleString()+'g';
                    if(out.bounty) out.formatted.bounty = Colors.GOLD+out.bounty.toLocaleString()+'g';
                    out.formatted.xp = Colors.AQUA+out.stats.xp.toLocaleString();
                    const playMinutes = getRef(pit,'pit_stats_ptl','playtime_minutes') || 0;
                    out.formatted.playtime = '§f'+Math.floor(playMinutes/60)+'h '+((playMinutes%60!=0)?playMinutes%60+'m':'');
                    Promise.all(pending).then(vals => {
                        for(chunk of vals){
                            fillRef(out, chunk.data, ...chunk.path);
                        }
                        resolve({success:true,data:out});
                    });
                }else{
                    resolve({success:false,error:"This player has no pit stats!"});
                }
            }
        });
    });
}

function getLifeRenown(pit){
    let sub = getRef(pit,'profile','renown')||0;
    sub += 2*(getRef(pit,'pit_stats_ptl','dark_pants_crated')||0);
    unlocks = getRef(pit,'profile','renown_unlocks')||[];
    for(let i = 0; i < unlocks.length; i++){
        sub += pitMaster.Pit.RenownUpgrades[unlocks[i].key].Costs[unlocks[i].tier];
    }
    return sub;
}

function getShopSpentRenown(pit){
    return (getRef(pit,'profile','renown_unlocks')||[])
        .reduce((a,{tier,key})=>a+pitMaster.Pit.RenownUpgrades[key].Costs[tier],0);
}

function subDescription(upgrade,tier,raw){
    upgrade = JSON.parse(JSON.stringify(upgrade));
    if(upgrade.Extra.Formatting=="Reveal"){
        if(tier<0)tier=0;
        upgrade.Description = upgrade.Description.slice(0,1+tier+upgrade.Extra.IgnoreIndex);
    }else if(upgrade.Extra.Formatting=="Seperated"){
        if(tier<0)tier=0;
        upgrade.Description = upgrade.Description[tier];
    }else if(upgrade.Extra.Formatting=="ApiReference"){
        if(tier<0)tier=0;
        let data = getRef(raw,...upgrade.Extra.Ref);
        if(upgrade.Extra.Function=='toHex') data = toHex(data);
        upgrade.Description = upgrade.Description.map(line=>line.replace('$',data));
        upgrade.Item.Meta = upgrade.Item.Meta.replace('$',data);
    }else{
        upgrade.Description = upgrade.Description.map(line=>line.replace('$',(tier<0)?0:upgrade.Levels[tier]));
    }
    return upgrade;
}

function toHex(n){
    if(typeof n == "undefined") n = 10511680;
    let str = n.toString(16);
    if(str!='0') while(str.length<6)str='0'+str;
    return str;
}

function getMcItem(p1, p2){
    if(minecraftItems[p1]){
        if(Array.isArray(minecraftItems[p1])) return minecraftItems[p1][p2];
        else return minecraftItems[p1];
    }
}

function getRef(dest, ...path){
    if(path.length==1) {
        return dest[path.shift()];
    }
    else if(path.length>1){ 
        if(dest[path[0]]) return getRef(dest[path.shift()], ...path);
    }
}

function fillRef(dest, data, ...path){
    if(path.length==1) {
        dest[path.shift()]=data;
    }
    else if(path.length>1){
        if(!dest[path[0]]) dest[path[0]]={};
        fillRef(dest[path.shift()], data, ...path);
    }
}

function checkStatus(logout, login, save){
    return {online:logout<login, lastseen:lastSave(save)};
}

function lastSave(save){
    return "Last seen in pit " + timeSince(save) + " ago";
}


function timeSince(date) { // https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval < 5) {
        return "moments";
    }
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function createItem(name, desc, id, meta, count=1){
    return {name: name, desc: desc, id: id, meta: meta, count:count};
}



function unpack(inv, name, rowsize,size,arrayfn){
    return new Promise((resolve, reject)=>{
        if(!inv || !inv.data) resolve({path: ["inventories", name], data:formatItemArr([], rowsize, size)});
        const inflated = inflate(Buffer.from(inv.data));
        //nbt.parse(Buffer.from(inv.data), (err,inv)=>{
        nbt.parse(inflated, (err,inv)=>{
            
            if(err || inv.value.i.value.value.length==0) resolve({path: ["inventories", name], data:formatItemArr([], rowsize, size)});
            else{
                let items = [];
                while(inv.value.i.value.value.length < size) inv.value.i.value.value.push({});
                for(item of inv.value.i.value.value){
                    let cur = getRef(item, "tag","value","display","value","Name","value") || getMcItem(getRef(item, "id","value"), getRef(item, "Damage","value"));
                    if(cur){
                        let id = getRef(item, "id", "value");
                        let meta = getRef(item, "Damage", "value");
                        if(id >=298&&id<=301)meta=toHex(getRef(item, "tag", "value","display","value","color","value"));
                        let lore = (getRef(item, "tag","value","display","value","Lore","value","value")||[]).concat((getRef(item, "tag", "value", "ench", "value", "value")||[]).map(ench=>`${Colors.GRAY}${minecraftEnchants.find(el=>el.id==ench.id.value).displayName} ${romanNumGen(ench.lvl.value)}`));
                        items.push(createItem(cur,lore,id,meta,getRef(item,"Count","value")));
                    }else{
                        items.push(blueprintItem);
                    }
                }
                if(arrayfn) items = arrayfn(items);
                if(items.length>0)resolve({path: ["inventories", name], data: formatItemArr(items,rowsize,size)});
                else resolve({path: [], data: ""});
            }
        });
    });
}

function formatItemArr(items, width, slots){
    return {items:items,width:width,slots:slots};
}

function getPresXp(xp,pres){
    if(pres>0)xp -= pitMaster.Pit.Prestiges[pres-1].SumXp;
    return xp;
}

function getLevel(xp, pres) {
    xp=getPresXp(xp,pres);
    let sum = 0;
    for (var level = 0; xp >= sum; level++)
    {
        if (level == 121) break;
        sum += pitMaster.Pit.Prestiges[pres].Multiplier * pitMaster.Pit.Levels[Math.floor(level / 10)].Xp;
    }
    level--;
    return level;
}

function calcBounty(bumps){
    if(bumps) return bumps.reduce((acc,bump)=>acc+bump.amount,0);
}


function levelString(prestige,level){
    let lc = pitMaster.Pit.Levels[Math.floor(level/10)].ColorCode;
    if(prestige==0) return Colors.GRAY+'['+lc+level+Colors.GRAY+']';
    let pc=pitMaster.Pit.Prestiges[prestige].ColorCode;
    return pc+'['+Colors.YELLOW+romanNumGen(prestige)+pc+'-'+lc+level+pc+']';
}

function romanNumGen(int) { //from some random stack overflow idek
    let roman = '';

    roman +=  'M'.repeat(int / 1000);  int %= 1000; 
    roman += 'CM'.repeat(int / 900);   int %= 900; 
    roman +=  'D'.repeat(int / 500);   int %= 500;  
    roman += 'CD'.repeat(int / 400);   int %= 400;
    roman +=  'C'.repeat(int / 100);   int %= 100;
    roman += 'XC'.repeat(int / 90);    int %= 90;
    roman +=  'L'.repeat(int / 50);    int %= 50;
    roman += 'XL'.repeat(int / 40);    int %= 40;
    roman +=  'X'.repeat(int / 10);    int %= 10;
    roman += 'IX'.repeat(int / 9);     int %= 9;
    roman +=  'V'.repeat(int / 5);     int %= 5;
    roman += 'IV'.repeat(int / 4);     int %= 4;
    roman +=  'I'.repeat(int);

    return roman;
}

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