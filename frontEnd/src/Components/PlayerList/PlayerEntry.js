import React, {useState} from 'react';
import MinecraftText from '../Minecraft/MinecraftText';

function PlayerList(props){
    let [text, setText] = useState("§7Loading");
    props.getUser(props.uuid).then(setText);
    return (
        <a title={props.hover} style={{display:'block'}} href={`/players/${props.uuid}`}>
            <MinecraftText raw={text}/>
        </a>
    );
} export default PlayerList;