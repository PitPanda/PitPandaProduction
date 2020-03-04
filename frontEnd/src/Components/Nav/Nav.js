import React from 'react';
import {withRouter} from 'react-router-dom';
import './Nav.css';

function Nav(props){
    console.log(props);
    function onClick(ref){
        props.history.push(ref);
    }
    return (
        <ul className='nav'>
            <li onClick={()=>onClick('/')}><strong>Pit Panda</strong></li>
            <li onClick={()=>onClick('/itemsearch')}>Mystic Searcher</li>
        </ul>
    );
} export default withRouter(Nav);