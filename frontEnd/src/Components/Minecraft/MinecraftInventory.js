import React from 'react';
import MinecraftItemSlot from './MinecraftItemSlot';
import './minecraftStyles.css';

class MinecraftInventory extends React.Component {
    constructor(props){
        super(props);
        const width = props.width || 9;
        const rows = props.rows || 1;
        let len = (props.inventory || []).length;
        const toFill = Math.max(
            rows*width-len,
            width*Math.ceil(len/width)-len
        );
        let filler = new Array(toFill).fill({});
        let style = {...props.style} || {};
        style.maxWidth=`${55.4*width}px`;
        this.state = {
            inventory: props.inventory,
            width,
            style,
            filler
        };
    }

    static getDerivedStateFromProps(props,state){
        if(props.inventory===state.inventory)return state;
        const width = props.width || 9;
        const rows = props.rows || 1;
        let len = (props.inventory || []).length;
        const toFill = Math.max(
            rows*width-len,
            width*Math.ceil(len/width)-len
        );
        let filler;
        if(toFill===state.filler.length) filler = state.filler;
        else filler = new Array(toFill).fill({});
        let style = props.style || {};
        style.maxWidth=`${55.4*width}px`;
        return {
            inventory: props.inventory,
            width,
            style,
            filler
        };
    }

    render() {
        return (
            <div style={this.state.style} className="MinecraftInventory">
                {(this.state.inventory||[]).map((item,index)=>(
                    <MinecraftItemSlot 
                        key={(item.uuid||'')+index} item={item} colors={this.props.colors}
                        onClick={this.props.onClick?e=>this.props.onClick(index,e):()=>{}}
                        onContextMenu={this.props.onContextMenu?e=>this.props.onContextMenu(index,e):()=>{}}
                    />
                ))}
                {this.state.filler.map((blank,index)=>(
                    <MinecraftItemSlot 
                        key={'filler'+index} item={blank} 
                        onClick={this.props.onClick?e=>this.props.onClick(index,e):()=>{}} 
                        onContextMenu={this.props.onContextMenu?e=>this.props.onContextMenu(index,e):()=>{}}
                    />
                ))}
            </div>
        );
    }
}

export default MinecraftInventory;