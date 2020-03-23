import React, {useEffect, useState} from 'react';
import queryString from 'query-string';
import StaticCard from '../Cards/StaticCard';
import MinecraftText from '../Minecraft/MinecraftText';

async function getLeaderboard(props){
    try{
        const pageRequest = await fetch(`/api/leaderboard/${props.category||'xp'}?page=${props.page||0}`);
        const json = await pageRequest.json();
        console.log(json);
        if(!json.success) return {error:json.error||'An error occured'};
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
    const [data, setData] = useState([]);

    useEffect(()=>{
        return props.history.listen(
            async location => setTarget( getQuery( location.search ) )
        );
    });

    useEffect(()=>{
        let alive = true;
        (async ()=>{
            let stats = await getLeaderboard(target);
            if(alive) setData(stats);
        })();
        return () => alive = false;
    }, [target]);

    return (
        <>
            <h1 className="page-header" style={{marginBottom:'100px',textAlign:'center'}}>Pit Panda Leaderboards</h1>
            <div style={{textAlign:'left',width:'1020px', margin:'auto'}}>
                <StaticCard title="Leaderboard Selector" style={{width:'350px', display:'inline-block', verticalAlign:'top',marginRight:'20px'}}>
                    
                </StaticCard>
                <StaticCard title={target.category} style={{width:'650px', display:'inline-block'}}>
                    {data.map((user,index)=>(
                        <div key={user.uuid} style={{borderTop:(index!==0?'2px solid #444':'none'), padding: '5px'}}>
                            <MinecraftText style={{width:'10%', textAlign:'center' ,display:'inline-block'}} text={`#${target.page*100+index+1}`} />
                            <MinecraftText raw={user.name} style={{width:'50%'}}/>
                            <MinecraftText text={user.score.toLocaleString()} style={{width:'40%',textAlign:'right'}}/>
                        </div>
                    ))}
                </StaticCard>
            </div>
        </>
    );
}

export default Leaderboard;