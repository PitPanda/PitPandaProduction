import React from 'react';
import './ProgressBar.css';
import MinecraftText from './../Minecraft/MinecraftText';
import MinecraftItemImg from './../Minecraft/MinecraftItemImg';

class ProgressBar extends React.Component {
    render() {
        const {per = 0, str = "0/0", hover = '???'}=this.props.info;
        const {id, meta} = this.props.item;
        return (
            <div title={hover} className="ProgressBar" style={this.props.style}>
                <div className={`progress-icon ${this.props.type}bg`}>
                    <MinecraftItemImg id={id} meta={meta}/>
                </div>
                <div style={{display:'inline-block',minWidth:'270px',verticalAlign:'top'}}>
                    <MinecraftText text={this.props.title} className="progress-name"/>
                    <div className="progress-bar">
                        <div className={`progress-bar-progress ${this.props.type}bg`} style={{width:(Math.min(per,1)*97+3)+'%'}}/>
                        <MinecraftText text={str} className="progress-bar-text textshadow"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProgressBar;
