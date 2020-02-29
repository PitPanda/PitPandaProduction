import React from 'react';
import parseStyle from '../../scripts/colorCodes.js';
import './minecraftStyles.css';

class MinecraftText extends React.PureComponent{
    static getDerivedStateFromProps(props,state){
        if(props.raw!==state.raw||props.text){
            if(props.text){
                state.text = props.text;
            }else{
                state.text = parseStyle(props.raw).raw;
            }
        }
        return state;
    }

    state={raw:this.props.raw,text:this.props.raw?parseStyle(this.props.raw).raw:this.props.text};

    render(){
        return (
            <span className={`MinecraftText ${this.props.className}`} style={this.props.style} dangerouslySetInnerHTML={{__html:this.state.text}} onClick={this.props.onClick}></span>
        );
    }
}

export default MinecraftText;
