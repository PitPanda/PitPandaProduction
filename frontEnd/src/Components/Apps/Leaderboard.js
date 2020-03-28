import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import StaticCard from '../Cards/StaticCard';
import MinecraftText from '../Minecraft/MinecraftText';
import Link from '../Link/Link';
import PageSelector from '../PageSelector/PageSelector';
import { timeSince } from '../../scripts/frontendTools';
import boards from '../../scripts/leaderboards';

const defaultCategory = 'lavaBuckets';

async function getLeaderboard({ category = defaultCategory, page = 0 }) {
    try {
        const pageRequest = await fetch(`/api/leaderboard/${category}?page=${page}`);
        const json = await pageRequest.json();
        console.log(json);
        if (!json.success) return { error: (json.error || 'An error occured') };
        return json.leaderboard;
    } catch (e) {
        return { error: e };
    }
}

async function getIndexerStatus() {
    const response = await fetch('/api/indexer');
    if (!response.ok) return {error:response.statusText};
    const data = await response.json();
    console.log(data);
    return data.data;
}

function getQuery(search) {
    let query = queryString.parse(search);
    return { category: query.category || defaultCategory, page: query.page || 0 };
}

function Leaderboard(props) {
    const [target, setTarget] = useState(getQuery(props.location.search));
    const [data, setData] = useState({ entires: [], loadedType: defaultCategory, loadedPage: 0 });
    const [indexData, setIndexData] = useState(
        { 
            finished: false, 
            currentPosition: 0, 
            estimatedCount: 0, 
            info: { 
                currentQueueCount: 0, 
                maxBatchSize: 1, 
                maxQueueSize: 1000, 
                batchTimeout: 1000, 
                lastQueueChange: 0 
            } 
        }
    );

    useEffect(() => {
        return props.history.listen(
            async location => setTarget(getQuery(location.search))
        );
    });

    useEffect(() => {
        let alive = true;
        getLeaderboard(target).then(stats=>{
            if(alive){
                if (stats.error) setData({ entires: [], loadedType: target.category, loadedPage: target.page });
                else setData({ entires: stats, loadedType: target.category, loadedPage: target.page });
            }
        }).catch(console.err);
        getIndexerStatus().then(indexer=>{
            if(alive && !indexer.error) setIndexData({ finished: true, ...indexer });
        }).catch(console.err);
        return () => alive = false;
    }, [target]);

    function linkBuilder(n){
        return `/leaderboard?category=${target.category}&page=${n-1}`;
    }

    return (
        <>
            <h1 className="page-header" style={{ marginBottom: '100px', textAlign: 'center' }}>Pit Panda Leaderboards</h1>
            <div style={{ textAlign: 'left', width: '1020px', margin: 'auto' }}>
                <div style={{ display: 'inline-block', verticalAlign: 'top', marginRight: '20px' }}>
                    <StaticCard title="Leaderboard Selector" style={{ width: '350px' }}>
                        {Reflect.ownKeys(boards).map(key => {
                            const board = boards[key];
                            return (
                                <div key={key+target.category}>
                                    <Link href={`/leaderboard?category=${key}&page=0`}>
                                        <MinecraftText raw={(key===target.category?'§f':'')+board.short}/>
                                    </Link>
                                </div>
                            );
                        })}
                    </StaticCard>
                    <StaticCard title="Disclaimer" style={{ width: '350px' }}>
                        This leaderboard does not contain <em>every</em> pit player.
                        This leaderboard also does not update instantly, it should update a minimum of once a day.
                        Technical details about the leaderboard updating is below.
                    </StaticCard>
                    <StaticCard title="Indexer Status" style={{ width: '350px' }}>
                        <MinecraftText className='text-title' style={{ color: indexData.finished ? 'green' : 'red' }} text={indexData.finished ? 'Online' : 'Offline'} /><br />
                        <MinecraftText text={`Last queue batch ${timeSince(indexData.info.lastQueueChange)} ago`} />
                        <MinecraftText text={`Current Position`} /> <MinecraftText style={{ color: 'gold' }} text={`${indexData.currentPosition.toLocaleString()} / ${indexData.estimatedCount.toLocaleString()}`} /><br />
                        <br />
                        <MinecraftText text={`More Stats`} style={{ color: 'green' }} />
                        <br />
                        <MinecraftText text={`Max Batch Size: ${indexData.info.maxBatchSize}`} /><br />
                        <MinecraftText text={`Max Queue Size: ${indexData.info.maxQueueSize}`} /><br />
                        <MinecraftText text={`Batch Timeout: ${indexData.info.batchTimeout}`} /><br />
                        <MinecraftText text={`Current Queue Iteration: ${indexData.info.currentQueueCount}`} />

                    </StaticCard>
                </div>

                <StaticCard title={boards[data.loadedType].displayName} style={{ width: '650px', display: 'inline-block' }}>
                    {data.entires.map((user, index) => (
                        <div key={user.uuid} style={{ borderTop: (index !== 0 ? '2px solid #444' : 'none'), padding: '5px' }}>
                            <MinecraftText style={{ width: '10%', textAlign: 'center', display: 'inline-block' }} text={`#${data.loadedPage * 100 + index + 1}`} />
                            <Link href={`/players/${user.uuid}`}>
                                <MinecraftText raw={user.name} style={{ width: '50%' }} />
                            </Link>
                            <MinecraftText text={boards[data.loadedType].transform(user.score)} style={{ width: '40%', textAlign: 'right', paddingRight: '8px' }} />
                        </div>
                    ))}
                    {data.entires.length?<PageSelector start={1} current={Number(target.page)+1} linkBuilder={linkBuilder}/>:''}
                </StaticCard>
            </div>
        </>
    );
}

export default Leaderboard;