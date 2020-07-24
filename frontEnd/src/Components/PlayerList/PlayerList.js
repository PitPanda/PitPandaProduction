import React, {useState} from 'react';
import PlayerEntry from './PlayerEntry';

function PlayerList(props){
    let clone = props.players.slice();
    let tmpGroupQueue = [];
    while(clone.length){
        tmpGroupQueue.push(clone.splice(0,10));
    }
    let [groupQueue, setGroupQueue] = useState(tmpGroupQueue);
    let [hasMore, setHasMore] = useState(groupQueue.length);
    let [initiated, setInitiated] = useState(false);
    let [loaded, setLoaded] = useState([]);
    if(props.instant&&!initiated) initiate();
    function initiate(){
        setInitiated(true);
        loadMore();
    }
    function loadMore(){
        setLoaded(loaded.concat(groupQueue[0]));
        setGroupQueue(groupQueue.slice(1));
        setHasMore(groupQueue.length-1);
    }
    return (
        <>
            {loaded.map((player)=><PlayerEntry key={player.tag} uuid={player.tag} hover={player.hover}  history={props.history}/>)}
            {hasMore?(
                <div style={{textAlign:'center'}}>
                    {initiated?(
                        <input type="button" className="srchBtn" value="Load More" style={{marginTop:'10px'}} onClick={loadMore}/>
                    ):(
                        <input type="button" className="srchBtn" value="Load" style={{margin:0}} onClick={initiate}/>
                    )}
                </div>
            ):''}
        </>
    );
} export default PlayerList;