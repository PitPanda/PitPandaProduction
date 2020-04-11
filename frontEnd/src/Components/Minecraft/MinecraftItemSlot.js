import React from 'react';
import MinecraftItemDescription from './MinecraftItemDescription';
import MinecraftItemImg from './MinecraftItemImg';
import './minecraftStyles.css';

const colors = [
    'cRed',
    'eYellow',
    '9Blue',
    '6Orange',
    'aGreen',
];

function MinecraftItemSlot(props){
    let cls = '';
    let {name = '', desc = [], id=0, meta=0, count=1, nonce} = props.item;
    if(props.colors){
        if(desc.some(line=>line.includes('RARE'))) cls = 'rare';
        if(name.toLowerCase().includes('bountiful')) cls = 'bountiful';
        if(name.toLowerCase().includes('legendary')) cls = 'legendary';
        if(name.toLowerCase().includes('extraordinary')) cls = 'extraordinary';
        if(name.toLowerCase().includes('unthinkable')) cls = 'unthinkable';
        if(name.toLowerCase().includes('evil')) cls = 'evil';
        if(name.toLowerCase().includes('artifact')) cls = 'artifact';
        if(name.toLowerCase().includes('miraculous')) cls = 'miraculous';
        if(name.toLowerCase().includes('overpowered')) cls = 'overpowered';
    }
    if((id===261 || id===283) && nonce > 20 && !name.includes('III')){
        desc = [...desc,'',(`§7Requires §${colors[nonce%5]} Pants §7to Tier 3`)];
    }
    return (
        <div className={`item ${cls}`} onClick={props.onClick} onContextMenu={props.onContextMenu}>
            <MinecraftItemImg id={id} meta={meta} count={count}/>
            {
                (name.length>0||desc.length>0)?
                <div className={`itemcontainer ${count===0?'halfgrey':''}`}>
                    <MinecraftItemDescription name={name} description={desc}/>
                </div>:''
            }
        </div>
    );
}

export default React.memo(MinecraftItemSlot);