import React from 'react';
import uuid from 'uuid';
import MinecraftItemSlot from './MinecraftItemSlot';

class MinecraftInventory extends React.Component {
    state = {selected:-1};

    constructor(props){
        super(props);
        this.width = props.width || 9;
        this.rows = props.rows || 1;
        const {inventory=[]} = props;
        this.items = JSON.parse(JSON.stringify(inventory))
            .concat(
                new Array(
                    Math.max(
                        this.rows*this.width-inventory.length,
                        this.width*Math.ceil(inventory.length/this.width)-inventory.length
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
        style.maxWidth=`${55.4*this.width}px`;
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