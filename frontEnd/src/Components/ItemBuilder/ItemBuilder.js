import React from 'react';
import './ItemBuilder.css';
import EnchantButton from './EnchantButton';

class ItemBuilder extends React.Component {
    state={selected:new Array(3).fill({key:'none',tier:0})};

    update = (index,key,tier)=>{
        let selected = this.state.selected;
        selected[index]={key,tier};
        this.setState({selected})
    }

    render() {
        return (
            <div className="ItemBuilder">
                {new Array(3).fill(0).map((_,i)=>(
                    <EnchantButton key={i} report={(key,tier)=>this.update(i,key,tier)}/>
                ))}
                <div style={{margin:'auto',textAlign:'center'}}>
                    <button onClick={()=>this.props.report(this.state.selected)} className='srchBtn'>Search</button>
                </div>
            </div>
        )
    }
}

export default ItemBuilder;