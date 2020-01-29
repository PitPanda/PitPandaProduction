import React from 'react';
import uuid from 'uuid';
import MinecraftItemSlot from './MinecraftItemSlot';

class MinecraftInventory extends React.Component {
    state = {selected:-1};

    constructor(props){
        super(props);
        this.items = JSON.parse(JSON.stringify(this.props.inventory.items))
            .concat(
                new Array(
                    Math.max(
                        this.props.inventory.slots-this.props.inventory.items.length,
                        this.props.inventory.width*Math.ceil(this.props.inventory.items.length/this.props.inventory.width)-this.props.inventory.items.length
                    )
                ).fill(0).map(()=>({}))
            );
        for(let item of this.items){
            item.uuid = uuid.v4();
        }
    }

    changeSelected = n => {
        if(this.state.selected===n) this.setState({selected:-1});
        else this.setState({selected:n});
    }

    render() {
        let style = {};
        if(this.props.style) style = JSON.parse(JSON.stringify(this.props.style));
        style.maxWidth=`${55.4*this.props.inventory.width}px`;
        return (
            <div style={style} className="MinecraftInventory">
                {this.items.map(item=>{
                    return (
                        <MinecraftItemSlot selected={this.state.selected===item.uuid} id={item.uuid} key={item.uuid} item={item} colors={this.props.colors} changeSelected={this.changeSelected}/>
                    );
                })}
            </div>
        );
    }
}

export default MinecraftInventory;