import React from 'react';
import {withRouter} from 'react-router-dom';

function Link(props){
    const onClick = e => {
        if(!e.ctrlKey){
            if(props.href!==window.location.pathname+window.location.search) props.history.push(props.href);
        } 
        else window.open(`${window.location.origin}${props.href}`).focus();
    }
    return (
        <span onClick={onClick} style={{cursor:'pointer',...(props.style||[])}}>
            {props.children}
        </span>
    );
} export default withRouter(Link);