import React, {useState} from 'react';
import MinecraftText from '../Minecraft/MinecraftText';
import getName from '../../scripts/playerName';

const buttonStyle = {
    display:'block',
    backgroundColor:'none',
    cursor:'pointer'
}

function PlayerEntry(props){
    let doc = getName(props.uuid);
    let [text, setText] = useState(doc.result?doc.result.name:"§7Loading");
    if(!doc.result) doc.promise.then(name=>setText(name))
    const redirect = () => props.history.push(`/players/${props.uuid}`);
    return (
        <span title={props.hover} style={buttonStyle} href={`/players/${props.uuid}`} onClick={redirect}>
            <MinecraftText raw={text}/>
        </span>
    );
} export default PlayerEntry;