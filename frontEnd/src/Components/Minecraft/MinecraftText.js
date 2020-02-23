import React from 'react';
import parseStyle from '../../scripts/colorCodes.js';
import './minecraftStyles.css';

function MinecraftText(props){
    let {text='', raw='', className='', style={}} = props;
    if(raw.length>0) text = parseStyle(raw).raw;
    return (
        <span className={`MinecraftText ${className}`} style={style} dangerouslySetInnerHTML={{__html:text}} onClick={props.onClick}></span>
    );
}

export default MinecraftText;
