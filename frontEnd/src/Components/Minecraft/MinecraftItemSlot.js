import React from 'react';
import MinecraftText from './MinecraftText';
import MinecraftItemImg from './MinecraftItemImg';

class MinecraftItemSlot extends React.Component {
    onClick = e => {
        if(!((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1))) this.props.changeSelected(this.props.id);
    }

    render() {
        let cls = '';
        const {name = '', desc = [], id=0, meta=0, count=1} = this.props.item;
        if(this.props.colors){
            if(desc.some(line=>line.includes('RARE'))) cls = 'rare';
            if(name.toLowerCase().includes('bountiful')) cls = 'bountiful';
            if(name.toLowerCase().includes('legendary')) cls = 'legendary';
            if(name.toLowerCase().includes('extraordinary')) cls = 'extraordinary';
            if(name.toLowerCase().includes('evil')) cls = 'evil';
            if(name.toLowerCase().includes('artifact')) cls = 'artifact';
            if(name.toLowerCase().includes('miracle')) cls = 'miracle';
        }
        return (
            <div className={`item ${cls} ${this.props.selected?'shown':''}`} onClick={this.onClick}>
                <MinecraftItemImg id={id} meta={meta} count={count}/>
                {
                    (name.length>0||desc.length>0)?
                    <div className={`mctooltip ${count===0?'halfgrey':''}`}>
                        <MinecraftText style={{marginBottom:'3px'}} className='text-title' raw={name}/> <br/>
                        {desc.map((line,i)=>
                            <React.Fragment key={this.props.id+'-'+i}>
                                <MinecraftText raw={line}/><br/>
                            </React.Fragment>
                        )}
                    </div>:''
                }
            </div>
        );
    }
}

export default MinecraftItemSlot;