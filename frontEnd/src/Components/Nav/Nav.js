import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import './Nav.css';

function Nav(props){
    function onClick(ref){
        props.history.push(ref);
    }
    let [selected, setSelected] = useState(0);
    useEffect(()=>{
        return props.history.listen((location)=>{
            let best = 0;
            for(let i = 0; i < buttons.length; i++){
                if(location.pathname.startsWith(buttons[i].path)) best = i;
            }
            setSelected(best);
        });
    });
    const buttons = [
        {name:'Pit Panda',path:'/'},
        {name:'Mystic Searcher',path:'/itemsearch'}
    ];
    return (
        <ul className='nav'>
            {buttons.map((info,index)=>(
                <li key={Date.now()+index} className={index===selected?'active':''} onClick={()=>onClick(info.path)}>{info.name}</li>
            ))}
        </ul>
    );
} export default withRouter(Nav);