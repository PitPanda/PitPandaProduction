import React from 'react';
import { withRouter } from 'react-router-dom';
import Link from '../Link/Link';

class PlayerForm extends React.Component {
    
    handleSubmit = e => {
        e.preventDefault();
        const srch = e.target.srchInp.value.trim().replace(/-/g,'');
        if(srch!=='') {
            this.props.history.push(`/players/${srch}`);
            e.target.srchInp.value='';
        }
    }

    render() {
        return (
            <div id="search-header">
                <h1 className="page-header">P<Link href='/signatures'>i</Link>t Panda</h1>
                <form onSubmit={this.handleSubmit}>
                    <h3 className="page-header">Advanced Pit Stats Grabber</h3>
                    <fieldset className="text-holder">
                        <input type="text" id="srchInp" name="lookup" placeholder="Enter a Minecraft Username or UUID..." style={{width:"50%"}}/>
                    </fieldset>
                    <fieldset className="button-holder">
                        <input type="submit" className="srchBtn" value="Search"/>
                    </fieldset>
                </form>
            </div>
        );
    }
}

export default withRouter(PlayerForm);