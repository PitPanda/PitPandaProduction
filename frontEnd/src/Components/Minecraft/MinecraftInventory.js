import React from 'react';
import uuid from 'uuid';
import MinecraftItemSlot from './MinecraftItemSlot';
import './minecraftStyles.css';

class MinecraftInventory extends React.Component {
    state={};

    static getDerivedStateFromProps(props,state){
        const width = props.width || 9;
        const rows = props.rows || 1;
        let inventory = props.inventory || [];
        const toFill = Math.max(
            rows*width-inventory.length,
            width*Math.ceil(inventory.length/width)-inventory.length
        );
        for(let i = 0; i < toFill; i++)inventory.push({fake:true});
        inventory = inventory.map(item=>{
            if(!item.uuid) item.uuid = uuid.v4();
            return item;
        });
        return {items:inventory,width};
    }

    render() {
        let style = {};
        if(this.props.style) style = JSON.parse(JSON.stringify(this.props.style));
        style.maxWidth=`${55.4*this.state.width}px`;
        return (
            <div style={style} className="MinecraftInventory">
                {this.state.items.map((item,index)=>(
                    <MinecraftItemSlot key={item.uuid} item={item} colors={this.props.colors} onClick={this.props.onClick?()=>this.props.onClick(index):()=>{}}/>
                ))}
            </div>
        );
    }
}

export default MinecraftInventory;