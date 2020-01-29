import React from 'react';
import './cardStyles.css'

class TabbedCard extends React.Component {

    state = {selected:0};

    onClick = (id,e) => {
        e.preventDefault();
        this.setState({selected:id});
    }

    render() {
        return (
            <div className="Card">
                <div className="Card-Head">
                    <ul>
                        {this.props.tabs.map((tab,i)=>(
                            <li style={{borderBottom: (i===this.state.selected)?'2px solid #999999':'none'}} key={i} onClick={e => this.onClick(i,e)}>
                                {tab}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="Card-Body">
                    {this.props.content[this.state.selected]}
                </div>
            </div>
        );
    }
}

export default TabbedCard;
