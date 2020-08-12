import React from 'react';
import {withRouter} from 'react-router-dom';

function Link(props){
    const onClick = e => {
        if(e.ctrlKey || e.button === 1) window.open(`${window.location.origin}${props.href}`).focus();
        else if((props.href!==window.location.pathname+window.location.search) && (e.button === 0)) {
            props.history.push(props.href);
            if(props.scroll) window.scrollTo(0,0);
        }
    }
    return (
        <div onMouseDown={onClick} style={{display:'inline',cursor:'pointer',...props.style}} className={props.className||''}>
            {props.children}
        </div>
    );
} export default withRouter(Link);