import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import Link from '../Link/Link';
import './Nav.css';

function Nav(props){
    const buttons = [
        {name:'Pit Panda',path:'/'},
        {name:'Mystic Searcher',path:'/itemsearch'},
        {name:'Leaderboard',path:'/leaderboard'},
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
        <div className='nav'>
            {buttons.map((info,index)=>(
                <Link key={Date.now()+index} href={info.path} className={index===selected?'active':''}>{info.name}</Link>
            ))}
        </div>
    );
} export default withRouter(Nav);