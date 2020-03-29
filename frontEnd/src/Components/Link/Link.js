import React from 'react';
import {withRouter} from 'react-router-dom';

function Link(props){
    const onClick = e => {
        if(e.ctrlKey) window.open(`${window.location.origin}${props.href}`).focus();
        else if(props.href!==window.location.pathname+window.location.search) {
            props.history.push(props.href);
            if(props.scroll) window.scrollTo(0,0);
        }
    }
    return (
        <span onClick={onClick} style={{cursor:'pointer',...(props.style||{})}}>
            {props.children}
        </span>
    );
} export default withRouter(Link);