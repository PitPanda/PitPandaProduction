import React, {useState} from 'react';
import MinecraftText from '../Minecraft/MinecraftText';

function PlayerList(props){
    let [text, setText] = useState("§7Loading");
    props.getUser(props.uuid).then(setText);
    return (
        <div title={props.hover}>
            <MinecraftText raw={text}/>
        </div>
    );
} export default PlayerList;