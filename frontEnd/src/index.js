import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import './index.css';
import Player from './Components/Apps/Player';
import Home from './Components/Apps/Home';
import ItemSearch from './Components/Apps/ItemSearch';
import Nav from './Components/Nav/Nav';
import Leaderboard from './Components/Apps/Leaderboard';
import Signatures from './Components/Apps/Signatures';

ReactDOM.render((
    <>
        <BrowserRouter>
            <Nav/>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/leaderboard" component={Leaderboard}/>
                <Route exact path="/signatures" component={Signatures}/>
                <Route exact path="/players/:id" component={Player}/>
                <Route exact path="/itemsearch/:query?" component={ItemSearch}/>
                <Redirect to="/"/>
            </Switch>
        </BrowserRouter>
    </>
), document.getElementById('root'));