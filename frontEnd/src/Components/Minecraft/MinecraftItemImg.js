import React from 'react';
import './itemStyles.css';

const mapped = [
    'ffaa00',
    '55ff55',
    '5555ff',
    'ffff55',
    'ff5555',
    '55ffff',
    '7dc383',
    '000000'
];

function MinecraftItemImg(props){
    const {id = 0, meta = 0, count = 1} = props;
    const inner = (count>1)?<span className='textshadow count'>{count}</span>:'';
    let style = JSON.parse(JSON.stringify((props.style || {})));
    if(id>=298&&id<=301&&!(id===300&&mapped.includes(meta))){//leather items
        style.backgroundColor = `#${meta}`;
        return (
            <div className={`item_ item_${id}  ${count===0?'grey':''}`} style={style} children={inner}/>
        );
    }else{
        return (
            <div className={`item_ item_${id} item_${id}_${meta} ${count===0?'darken':''}`} style={style} children={inner}/>
        );
    }
}

export default MinecraftItemImg;
