import React, {useState, useEffect} from 'react';
import MinecraftText from '../Minecraft/MinecraftText';
import getName from '../../scripts/playerName';
import {withRouter} from 'react-router-dom';
import Link from '../Link/Link';

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
            if(alive) {
                if(name.error) setText('§4ERROR');
                else setText(name);
            }
        })();
        return () => alive = false;
    }, [props.uuid]);
    return (
        <Link title={props.hover} style={buttonStyle} href={`/players/${props.uuid}`}>
            <MinecraftText raw={text}/>
        </Link>
    );
} export default withRouter(PlayerEntry);