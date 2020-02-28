import React from 'react';
import './ProgressBar.css';
import MinecraftText from './../Minecraft/MinecraftText';
import MinecraftItemImg from './../Minecraft/MinecraftItemImg';

class ProgressBar extends React.Component {
    render() {
        const {info, item} = this.props;
        const hover = info.message || Math.round(info.percent*1000)/10 + '%';
        return (
            <div title={hover} className="ProgressBar" style={this.props.style}>
                <div className={`progress-icon ${this.props.type}bg`}>
                    <MinecraftItemImg {...item}/>
                </div>
                <div style={{display:'inline-block',minWidth:'270px',verticalAlign:'top',height:'40px',paddingTop:'3px'}}>
                    <MinecraftText text={this.props.title} className="progress-name"/>
                    <div className="progress-bar">
                        <div className={`progress-bar-progress ${this.props.type}bg`} style={{width:(Math.min(info.percent,1)*97+3)+'%'}}/>
                        <MinecraftText text={info.description} className="progress-bar-text textshadow"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProgressBar;
