import React from 'react';
import './ItemBuilder.css';
import MinecraftText from '../Minecraft/MinecraftText';

class DropDownSelector extends React.Component {
    render() {
        return (
            <div className="DropDownSelector">
                <p>Choose One</p>
                <div className="DropDownSelectorContent">
                    {this.props.options.map(cur=>{
                        return (
                            <div key={cur[0]} onClick={()=>this.props.return(cur[0])} className="DropDownSelectorOption">
                                <MinecraftText raw={cur[1]}/><br/>
                            </div>
                        );
                    })}
                </div>
                {this.props.showClear?<p onClick={()=>this.props.return('none')} style={{textDecoration:'underline',marginTop:'6px',cursor:'pointer'}}>Clear Selection</p>:''}
            </div>
        );
    }
}

export default DropDownSelector;