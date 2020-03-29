import React, {useState, useEffect} from 'react';
import MinecraftText from '../Minecraft/MinecraftText';
import getName from '../../scripts/playerName';
import {withRouter} from 'react-router-dom';

const buttonStyle = {
    display:'block',
    backgroundColor:'none',
    cursor:'pointer'
}

function PlayerEntry(props){
    let [text, setText] = useState("§7Loading");
    useEffect(()=>{
        let alive = true;
        const doc = getName(props.uuid);
        (async()=>{
            const name = await doc.promise;
            if(alive) setText(name);
        })();
        return () => alive = false;
    }, [props.uuid]);
    const redirect = () => props.history.push(`/players/${props.uuid}`);
    return (
        <span title={props.hover} style={buttonStyle} href={`/players/${props.uuid}`} onClick={redirect}>
            <MinecraftText raw={text}/>
        </span>
    );
} export default withRouter(PlayerEntry);