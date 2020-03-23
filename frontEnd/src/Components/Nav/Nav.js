import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import './Nav.css';

function Nav(props){
    function onClick(ref){
        props.history.push(ref);
    }
    const buttons = [
        {name:'Pit Panda',path:'/'},
        {name:'Mystic Searcher',path:'/itemsearch'},
        //{name:'Leaderboard (beta)',path:'/leaderboard'},
    ];
    const findBest = (path) => {
        let best = 0;
        for(let i = 0; i < buttons.length; i++){
            if(path.startsWith(buttons[i].path)) best = i;
        }
        return best;
    }
    let [selected, setSelected] = useState(findBest(window.location.pathname));
    useEffect(()=>{
        return props.history.listen((location)=>setSelected(findBest(location.pathname)));
    });
    return (
        <ul className='nav'>
            {buttons.map((info,index)=>(
                <li key={Date.now()+index} className={index===selected?'active':''} onClick={()=>onClick(info.path)}>{info.name}</li>
            ))}
        </ul>
    );
} export default withRouter(Nav);