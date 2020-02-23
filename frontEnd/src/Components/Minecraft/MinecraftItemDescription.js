import React from 'react';
import MinecraftText from './MinecraftText';
import './minecraftStyles.css';

class MinecraftItemDescription extends React.Component {
    render() {
        return (
            <div className="mctooltip" style={this.props.style} onClick={this.props.onclick}>
                <MinecraftText style={{marginBottom:'3px'}} className='text-title' raw={this.props.name}/> <br/>
                {this.props.description.map((line,i)=>
                    <React.Fragment key={i}>
                        <MinecraftText raw={line}/><br/>
                    </React.Fragment>
                )}
            </div>
        );
    }
}

export default MinecraftItemDescription;