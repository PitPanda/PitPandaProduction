import React, { useState, useEffect } from 'react';
import MinecraftText from '../Minecraft/MinecraftText';
import boards from '../../scripts/leaderboards';
import Link from '../Link/Link';
//import { Link } from 'react-router-dom';

const formatPosition = (n)=>{
    if(typeof n === 'undefined') return 'Loading';
    if(n===null) return 'N/A';
    if(n<=3) return `§6#${n.toLocaleString()}`;
    if(n<=10) return `§e#${n.toLocaleString()}`;
    if(n<=25) return `§f#${n.toLocaleString()}`;
    else return `§7#${n.toLocaleString()}`;
}

export default (props) => {
    const [positions, setPositions] = useState({});
    useEffect(()=>{
        let alive = true;
        (async()=>{
            try{
                const request = await fetch(`/api/position/${props.uuid}`);
                const json = await request.json();
                console.log(json);
                if(alive){
                    if(!json.success) setPositions({error:(json.error||'An error has occured')});
                    else setPositions(json.rankings);
                }
            }catch(e){
                if(alive) setPositions({error:e});
            }
        })();
        return () => alive = false;
    }, [props.uuid]);
    return boards.ownKeys(props.hiddens).map(key=>(
        <Link href={`/leaderboard?category=${key}&page=${Math.floor(((positions[key]||1)-1)/100)}`} key={key} scroll={true}>
            <MinecraftText raw={`${boards[key].short}: ${formatPosition(positions[key])}`} /><br/>
        </Link>
    ));
}