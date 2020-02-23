import React from 'react';
import './ItemBuilder.css';
import pitMaster from '../../pitMaster.json';
import MinecraftText from '../Minecraft/MinecraftText';
import DropDownSelector from './DropDownSelector';
import frontendTools from '../../scripts/frontendTools';

let Mystics = pitMaster.Pit.Mystics;
const formatted = Object.entries(Mystics).sort(([,a],[,b])=>a.Name.substring(a.Name.indexOf('§9')+2)<b.Name.substring(b.Name.indexOf('§9')+2)?-1:1);

class EnchantButton extends React.Component {

    state={
        key:'none',
        tier:0,
        selecting:undefined
    }

    setKey = key => {
        let shouldTier = false;
        if(Mystics[key]&&Mystics[key].Descriptions.length>1) shouldTier = true;
        this.setState({key,selecting:shouldTier?'tier':undefined});
        this.props.report(key,this.state.tier);
    }

    setTier = tier => {
        this.setState({tier,selecting:undefined});
        this.props.report(this.state.key,tier);
    }

    render() {
        return (
            <div style={{display:'inline-block',width:'300px'}}>
                <div style={{textAlign:'center',cursor:'pointer'}} onClick={()=>this.setState({selecting:this.state.selecting?undefined:'enchant'})}>
                    <MinecraftText raw={(Mystics[this.state.key]||{Name:"§9None Selected"}).Name} />
                    <span> </span>
                    <MinecraftText raw={'§9'+((Mystics[this.state.key]&&Mystics[this.state.key].Descriptions.length>1)?(frontendTools.romanNumGen(this.state.tier)):'')} />
                </div>
                <div style={{visibility:this.state.selecting?'visible':'hidden',position:'absolute'}}>
                    {
                        (this.state.selecting==='enchant')?
                        <DropDownSelector options={formatted.map(m=>[m[0],m[1].Name])} return={this.setKey} showClear={this.state.key!=='none'}/>:
                        <DropDownSelector options={[[1,'§fI'],[2,'§fII'],[3,'§fIII']]} return={this.setTier}/>
                    }
                </div>
            </div>
        );
    }
}

export default EnchantButton;