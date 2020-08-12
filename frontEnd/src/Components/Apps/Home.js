import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import Link from '../Link/Link';
import TitlelessCard from '../Cards/TitlelessCard';
import frontendTools from '../../scripts/frontendTools';
import MinecraftText from '../Minecraft/MinecraftText';

export default (props) => {
  const [players, setPlayers] = useState();
  useEffect(() => {
    (async()=>{
      try{
        const data = await fetch('/api/randomplayers').then(r=>r.json());
        console.log(data);
        if(!data.success) return;
        setPlayers(data.players);
      }catch(e){
        console.error(e);
      }
    })();
  }, [props]);
  return (
    <React.Fragment>
      <Header/>
      <div style={{
        width: '80%',
        maxWidth: '880px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: 'auto',
      }}>
        {players?players.map(player => (
          <TitlelessCard key={player.uuid}style={{width:'410px',margin:'10px',display:'inline-block'}}>
            <Link href={`/players/${player.uuid}`}>
              <img 
                src={`https://crafatar.com/avatars/${player.uuid}?overlay=true`} 
                style = {{width:'100px', height:'100px', display:'inline-block'}}
                alt = ''
              />
              <div key={player.uuid} style={{verticalAlign:'top', display:'inline-block', marginTop:'7px',marginLeft:'10px', fontSize:'17px'}}>
                <MinecraftText style={{fontSize:'110%'}} raw={player.name}/><br/>
                <MinecraftText raw={`LVL: ${player.level}`}/><br/>
                <MinecraftText raw={`Gold: §6${player.gold.toLocaleString()}g`}/><br/>
                <MinecraftText raw={`Played: §f${frontendTools.minutesToString(player.playtime)}`}/>
              </div>
            </Link>
          </TitlelessCard>
        )):''}
      </div>
    </React.Fragment>
  );
}
