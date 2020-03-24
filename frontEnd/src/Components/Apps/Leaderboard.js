import React, {useEffect, useState} from 'react';
import queryString from 'query-string';
import StaticCard from '../Cards/StaticCard';
import MinecraftText from '../Minecraft/MinecraftText';
import Link from '../Link/Link';
import {minutesToString} from '../../scripts/frontendTools';

function toString(n){
    return toFixed(0)(n);
}

function toFixed(places){
    return (n)=>{
        if(typeof n === 'number') return n.toLocaleString('en-US', {
                minimumFractionDigits: places,      
                maximumFractionDigits: places,
            });
        else return n+'';
    }
}

const boards = new Proxy({
    kills: {
        displayName:"Top Kills",
        short:"Kills"
    },
    assists: {
        displayName:"Top Assists",
        short:"Assists"
    },
    damageDealt: {
        displayName:"Top Damage Dealt",
        short:"Damage Dealt"
    },
    damageReceived: {
        displayName:"Top Damage Received",
        short:"Damage Received"
    },
    damageRatio: {
        displayName:"Top Damage Ratio",
        short:"Damage Ratio",
        transform: toFixed(2),
        hidden: true
    },
    highestStreak: {
        displayName:"Top Streaks",
        short:"Streaks"
    },
    deaths: {
        displayName:"Top Deaths",
        short:"Deaths"
    },
    kdr: {
        displayName:"Top Kill Death Ratio",
        short:"Kill Death Ratio",
        transform: toFixed(2),
        hidden: true
    },
    xp: {
        displayName:"Top Total XP",
        short:"Total XP"
    },
    gold: {
        displayName:"Top Current Gold",
        short:"Current Gold"
    },
    lifetimeGold: {
        displayName:"Top Lifetime Gold Grinded",
        short:"Lifetime Gold"
    },
    playtime: {
        displayName:"Top Playtime",
        short:"Playtime",
        transform: minutesToString
    },
    contracts: {
        displayName:"Top Contracts Completed",
        short:"Contracts Completed"
    },
    gapples: {
        displayName:"Top Golden Apples Eaten",
        short:"Golden Apples"
    },
    gheads: {
        displayName:"Top Golden Heads Eaten",
        short:"Golden Heads"
    },
    lavaBuckets: {
        displayName:"Top Lava Buckets Emptied",
        short:"Lava Buckets"
    },
    soups: {
        displayName:"Top Soups Drank",
        short:"Soups Drank"
    },
    tierThrees: {
        displayName:"Top Tier 3 Mystics Enchanted",
        short:"Mystics Enchanted"
    },
    darkPants: {
        displayName:"Top Dark Pants Created",
        short:"Dark Pants Created"
    },
    leftClicks: {
        displayName:"Top Left Clicks",
        short:"Left Clicks"
    },
    chatMessages: {
        displayName:"Top Chat Messages",
        short:"Chat Messages"
    },
    wheatFarmed: {
        displayName:"Top Wheat Farmed",
        short:"Wheat Farmed"
    },
    fishedAnything: {
        displayName:"Top Anything Fished",
        short:"Anything Fished"
    },
    blocksBroken: {
        displayName:"Top Blocks Broken",
        short:"Blocks Broken",
        hidden: true
    },
    blocksPlaced: {
        displayName:"Top Blocks Placed",
        short:"Blocks Placed",
        hidden: true
    },
    kingsQuests: {
        displayName:"Top Kings Quest Completions",
        short:"Kings Quest"
    },
    sewerTreasures: {
        displayName:"Top Sewer Treasures Found",
        short:"Sewer Treasures"
    },
    nightQuests: {
        displayName:"Top Night Quests Completed",
        short:"Night Quests"
    },
    renown: {
        displayName:"Top Current Renown",
        short:"Current Renown"
    },
    lifetimeRenown: {
        displayName:"Top Lifetime Renown Earned",
        short:"Lifetime Renown"
    },
    arrowShots: {
        displayName:"Top Arrows Shot",
        short:"Arrows Shot",
        hidden: true
    },
    arrowHits: {
        displayName:"Top Arrow Hits",
        short:"Arrow Hits",
        hidden: true
    },
    jumpsIntoPit: {
        displayName:"Top Jumps into Mid",
        short:"Jumps into Mid",
        hidden: true
    },
    launcherLaunches: {
        displayName:"Top Launcher Launches",
        short:"Launcher Launches",
        hidden: true
    },
    totalJumps: {
        displayName:"Top Entered Pit",
        short:"Entered Pit",
        hidden: true
    },
    bounty: {
        displayName:"Top Bounties",
        short:"Bounty",
        hidden: true
    },
    genesisPoints: {
        displayName:"Top Genesis Points",
        short:"Genesis Points",
        hidden: true
    },
    joins: {
        displayName:"Top Joins to Pit",
        short:"Joins",
        hidden: true
    },
    enderchestOpened: {
        displayName:"Top Enderchests Opened",
        short:"Enderchests Opened",
        hidden: true
    },
    error: {
        displayName:"Invalid Leaderboard",
        short:"Error",
        hidden: true
    },
    default: {
        displayName:"Leaderboard Name",
        short:"Category",
        transform: toString,
        hidden: true
    }
},{
    get: (target, prop)=>{
        if(!(prop in target)) prop = 'error';
        return new Proxy(target[prop],{
            get: (subTarget, subProp) => {
                if(subProp in subTarget) return subTarget[subProp];
                else return target.default[subProp];
            }
        });
    },
    ownKeys: (target)=>{
        return Object.entries(target).filter(([,{hidden}])=>!hidden).map(e=>e[0]).sort();
    }
});

async function getLeaderboard({category='xp',page=0}){
    try{
        const pageRequest = await fetch(`/api/leaderboard/${category}?page=${page}`);
        const json = await pageRequest.json();
        console.log(json);
        if(!json.success) return {error:(json.error||'An error occured')};
        return json.leaderboard;
    }catch(e){
        return {error:e};
    }
}

function getQuery(search){
    let query = queryString.parse( search );
    return { category: query.category||'xp', page: query.page||0 };
}

function Leaderboard(props){
    
    const [target, setTarget] = useState( getQuery( props.location.search ) );
    const [data, setData] = useState({entires:[],loadedType:'xp'});

    useEffect(()=>{
        return props.history.listen(
            async location => setTarget( getQuery( location.search ) )
        );
    });

    useEffect(()=>{
        let alive = true;
        (async ()=>{
            let stats = await getLeaderboard(target);
            if(alive) {
                if(stats.error) setData({entires:[],loadedType:target.category});
                else setData({entires:stats,loadedType:target.category});
            }
        })();
        return () => alive = false;
    }, [target]);

    return (
        <>
            <h1 className="page-header" style={{marginBottom:'100px',textAlign:'center'}}>Pit Panda Leaderboards</h1>
            <div style={{textAlign:'left',width:'1020px', margin:'auto'}}>
                <StaticCard title="Leaderboard Selector" style={{width:'350px', display:'inline-block', verticalAlign:'top',marginRight:'20px'}}>
                    {Reflect.ownKeys(boards).map(key=>{
                        const target = boards[key];
                        return (
                            <div key={key}>
                                <Link href={`/leaderboard?category=${key}&page=0`}>
                                    <MinecraftText text={target.short}/>
                                </Link>
                            </div>
                        );
                    })}
                </StaticCard>
                <StaticCard title={boards[data.loadedType].displayName} style={{width:'650px', display:'inline-block'}}>
                    {data.entires.map((user,index)=>(
                        <div key={user.uuid} style={{borderTop:(index!==0?'2px solid #444':'none'), padding: '5px'}}>
                            <MinecraftText style={{width:'10%', textAlign:'center' ,display:'inline-block'}} text={`#${target.page*100+index+1}`} />
                            <Link href={`/players/${user.uuid}`}>
                                <MinecraftText raw={user.name} style={{width:'50%'}}/>
                            </Link>
                            <MinecraftText text={boards[data.loadedType].transform(user.score)} style={{width:'40%',textAlign:'right',paddingRight:'8px'}}/>
                        </div>
                    ))}
                </StaticCard>
            </div>
        </>
    );
}

export default Leaderboard;