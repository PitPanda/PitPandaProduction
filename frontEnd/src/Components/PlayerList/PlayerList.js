import React, {useState} from 'react';
import PlayerEntry from './PlayerEntry';

let knownplayers = {};
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
    console.log(groupQueue);
    function initiate(){
        setInitiated(true);
        loadMore();
    }
    function loadMore(){
        setLoaded(loaded.concat(groupQueue[0]));
        setGroupQueue(groupQueue.slice(1));
        setHasMore(groupQueue.length);
    }
    function getUser(uuid){
        const promise = new Promise(resolve=>{
            if(knownplayers[uuid]){
                if(knownplayers[uuid].name) resolve(knownplayers[uuid].name);
                else knownplayers[uuid].promise.then(resolve);
            }else fetch(`/api/username/${uuid}`).then(res=>res.json()).then(json => {
                console.log(json);
                if(json.success) {
                    knownplayers[uuid].name=json.name;
                    resolve(json.name);
                } else resolve("§4ERROR");
            }).catch((err)=>{
                resolve("§4ERROR");
                console.log(err);
            });
        });
        knownplayers[uuid]={promise};
        return promise;
    }
    return (
        <>
            {initiated?(
                <>
                    {loaded.map((player,index)=><PlayerEntry getUser={getUser} key={index} uuid={player.victim} hover={new Date(player.timestamp).toLocaleString()}/>)}
                    {hasMore?<input type="button" className="srchBtn" value="Load More" style={{margin:0}} onClick={loadMore}/>:''}
                </>
            ):(
                <input type="button" className="srchBtn" value="Load" style={{margin:0}} onClick={initiate}/>
            )}
        </>
    );
} export default PlayerList;