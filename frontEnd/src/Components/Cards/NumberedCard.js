import React from 'react';
import './cardStyles.css';

class NumberedCard extends React.Component {


    constructor(props){
        super(props);
        this.state={selected:this.props.content.length-1};
    }

    numberOnClick = position => this.setState({selected:position});
    first = () => this.setState({selected:0});
    prev = () => this.setState({selected:this.state.selected-1});
    last = () => this.setState({selected:this.props.content.length-1});
    next = () => this.setState({selected:this.state.selected+1});

    render() {
        let start = Math.max(0,this.state.selected-2);
        let end = Math.min(this.state.selected+3,this.props.content.length);
        if(start===0) end = Math.min(5,this.props.content.length);
        else if(end===this.props.content.length) start = Math.max(0,this.props.content.length-5);
        return (
            <div className="Card" style={this.props.style}>
                <div className="Card-Head">
                    <div style={{display:'inline-block'}}>Prestige History</div>
                    {(this.props.content.length>1)?(
                    <div style={{display:'inline-block',float:'none',width:'60%',marginLeft:'20px'}}>
                        <div style={{display:'inline-block',width:'50px'}}>
                            {(start!==0)?(
                            <React.Fragment>
                                <div onClick={this.first} className='CardTitle'>&lt;&lt;</div>
                                <div onClick={this.prev} className='CardTitle'>&lt;</div>
                            </React.Fragment>
                            ):''}
                        </div>
                        <div style={{display:'inline-block',width:'235px'}}>
                            <div style={{margin:'0px 10px',display:'flex',justifyContent:'center'}}>
                                {this.props.content.slice(start,end).map((_,i)=>{
                                        const position = i+start;
                                        return (
                                            <div className='CardTitle' key={position} onClick={() => this.numberOnClick(position)}>
                                                <span style={{borderBottom: (position===this.state.selected)?'2px solid #999999':'none'}}>{position}</span>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </div>
                        <div style={{display:'inline-block',width:'50px'}}>
                            {(end!==this.props.content.length)?(
                                <React.Fragment>
                                    <div className='CardTitle' onClick={this.next}>&gt;</div>
                                    <div className='CardTitle' onClick={this.last}>&gt;&gt;</div>
                                </React.Fragment>
                            ):''}
                        </div>
                    </div>):''}
                </div>
                <div className="Card-Body">
                    {this.props.content[this.state.selected]}
                </div>
            </div>
        );
    }
}

export default NumberedCard;
