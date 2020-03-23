import React, {useState} from 'react';
import MinecraftText from '../Minecraft/MinecraftText';
import getDoc from '../../scripts/playerDoc';

const buttonStyle = {
    display:'block',
    backgroundColor:'none',
    cursor:'pointer'
}

function PlayerEntry(props){
    let doc = getDoc(props.uuid);
    let [text, setText] = useState(doc.result?doc.result.displayName:"§7Loading");
    if(!doc.result)doc.promise.then(doc=>setText(doc.displayName))
    const redirect = () => props.history.push(`/players/${props.uuid}`);
    return (
        <span title={props.hover} style={buttonStyle} href={`/players/${props.uuid}`} onClick={redirect}>
            <MinecraftText raw={text}/>
        </span>
    );
} export default PlayerEntry;