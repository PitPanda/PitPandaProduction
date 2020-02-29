import React from 'react';
import SearchField from '../SearchField/SearchField';
import StaticCard from '../Cards/StaticCard';
import pitMaster from '../../pitMaster.json';
import uuid from 'uuid';

let Mystics = pitMaster.Pit.Mystics;
Mystics.pants = {Name:'§fPants',Type:'pants',NoNumber:true};
Mystics.sword = {Name:'§fSword',Type:'sword',NoNumber:true};
Mystics.bow = {Name:'§fBow',Type:'bow',NoNumber:true};
Mystics.lives = {Name:'§fLives',Type:'resource'};
Mystics.maxLives = {Name:'§fMax Lives',Type:'resource'};
Mystics.tokens = {Name:'§fTokens',Type:'resource'};
Mystics.artifact = {Name:'§fArtifact',Type:'resource',NoNumber:true};
Mystics.rare = {Name:'§fRare',Type:'resource',NoNumber:true};
Mystics.legendary = {Name:'§fLegendary',Type:'resource',NoNumber:true};
Mystics.bountiful = {Name:'§fBountiful',Type:'resource',NoNumber:true};
Mystics.extraordinary = {Name:'§fExtraordinary',Type:'resource',NoNumber:true};
Mystics.overpowered = {Name:'§fOverpowered',Type:'resource',NoNumber:true};
Mystics.miraculous = {Name:'§fMiraculous',Type:'resource',NoNumber:true};
Mystics.nonce = {Name:'§fNonce',Type:'resource'};
Mystics.color = {Name:'§fColor',Type:'pants',Colors:{
    red:'0',
    yellow:'1',
    blue:'2',
    orange:'3',
    green:'4'
}};
Mystics['color0'] = {Name:'§fRed',Type:'pants',NoNumber:true};
Mystics['color1'] = {Name:'§fYellow',Type:'pants',NoNumber:true};
Mystics['color2'] = {Name:'§fBlue',Type:'pants',NoNumber:true};
Mystics['color3'] = {Name:'§fOrange',Type:'pants',NoNumber:true};
Mystics['color4'] = {Name:'§fGreen',Type:'pants',NoNumber:true};

const valid = ['pants','sword','bow','resource'];
const formatted = Object.entries(Mystics)
    .filter(([,ench])=>valid.includes(ench.Type))
    .sort(([,a],[,b])=>a.Name.substring(a.Name.indexOf('§9')+2)<b.Name.substring(b.Name.indexOf('§9')+2)?-1:1);

function createInputData(){
    return {id:uuid.v4(),ref:React.createRef(),reporting:'',says:''};
}

class QueryBox extends React.Component{

    state={
        inputs:[createInputData()],
        type:'*'
    }
    buttonRef=React.createRef();

    killInput = (index) => {
        if((index!==this.state.inputs.length-1&&index!==0)||(index!==0&&this.state.inputs[index-1].report==='')){
            let inputs = this.state.inputs;
            inputs[index-1].ref.current.focus();
            inputs[index-1].says+='_';
            clearTimeout(inputs[index].timeout)
            inputs = inputs.slice(0,index).concat(inputs.slice(index+1));
            this.setState({inputs});
        }
    }

    timeOutFix = (timeout,index) => {
        let inputs = this.state.inputs;
        inputs[index].timeout=timeout;
        this.setState({inputs});
    }

    monitorInputs = (report,raw,type,index) => {
        let inputs = this.state.inputs;
        inputs[index].reporting=report;
        inputs[index].says=raw;
        inputs[index].type=type;
        let foundType;
        for(const input of inputs){
            if(input.type&&input.type!=='resource'){
                foundType=input.type;
                this.setState({type:input.type})
            }
        }
        if(!foundType) this.setState({type:'*'});
        if(index+1===inputs.length){
            inputs.push(createInputData());
        }
        this.setState({inputs});
    }

    buildAndSendQuery = () => {
        let inputs = this.state.inputs;
        let toClear = inputs.filter((input,index)=>(input.reporting==='')&&index!==inputs.length-1);
        toClear.forEach(input=>clearTimeout(input.timeout))
        inputs = inputs.filter((input,index)=>(input.reporting!=='')||index===inputs.length-1);
        let queryString = inputs.slice(0,-1).map(i=>i.reporting).join();
        if(this.state.type!=='*') queryString+=','+this.state.type;
        this.props.query(queryString);
        this.setState({inputs});
    }

    focus = (index) => {
        if(this.state.inputs[index]){
            this.state.inputs[index].ref.current.focus();
        }else if(index>=this.state.inputs.length) this.buttonRef.current.focus();
    }

    render(){
        let suggestions = formatted;
        if(this.state.type!=='*') suggestions = suggestions.filter(([,ench])=>['resource',this.state.type].includes(ench.Type));
        return (
            <StaticCard title="Query" style={{width:'350px',display:'inline-block',verticalAlign:'top',margin:'20px',textAlign:'left'}}>
                {this.state.inputs.map((input,index)=>(
                    <SearchField 
                        up={()=>this.focus(index-1)} 
                        down={()=>this.focus(index+1)} 
                        says={input.says} 
                        timeOutFix={timeout=>this.timeOutFix(timeout,index)} 
                        kill={e=>this.killInput(index)} 
                        key={input.id} 
                        mainRef={input.ref} 
                        suggestions={suggestions} 
                        report={(a,b,c)=>this.monitorInputs(a,b,c,index)}
                    />
                ))}
                <button 
                    onClick={this.buildAndSendQuery} 
                    onKeyDown={e=>{if(e.keyCode===38)this.focus(this.state.inputs.length-1);}} 
                    ref={this.buttonRef} 
                    className='srchBtn' 
                    style={{marginTop:'0px'}}
                >Search</button>
            </StaticCard>
        );
    }
}

export default QueryBox;
