import React from 'react';
import './cardStyles.css';

class StaticCard extends React.Component {
  render() {
    return (
        <div className="Card" style={this.props.style}>
            <div className="Card-Body">
                {this.props.content||this.props.children}
            </div>
        </div>
    );
  }
}

export default StaticCard;
