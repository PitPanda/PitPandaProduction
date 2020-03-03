import React from 'react';
import StaticCard from '../Cards/StaticCard';
import TabbedCard from '../Cards/TabbedCard';
import NumberedCard from '../Cards/NumberedCard';
import MinecraftText from '../Minecraft/MinecraftText';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import ProgressBar from '../ProgressBar/ProgressBar';
import PlayerForm from './PlayerForm';
import frontendTools from '../../scripts/frontendTools';

class Player extends React.Component {
  state = {user:null};

  componentDidMount(){
    this.loadUser(`/players/${(this.props.match.params.id||'').trim()}`);
    this.props.history.listen((location,action,c)=>{
      this.loadUser(location.pathname);
    });
  }

  loadUser = (path) => {
    if(path.length===0)return;
    fetch(`/api${path}`).then(res=>res.json()).then(json => {
      console.log(json);
      if(json.success) {
        this.setState({user:json.data,error:undefined});
        document.title = `Pit Panda - ${json.data.name}`;
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        link.href = `https://crafatar.com/avatars/${json.data.uuid}?overlay=true`;
        document.getElementsByTagName('head')[0].appendChild(link);
      } else this.setState({error:json.error,user:undefined});
    }).catch((err)=>{
      this.setState({error:err,user:undefined});
      console.log(err);
    });
  }

  render() {
    return (
      <React.Fragment>
        <PlayerForm history={this.props.history}/>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {this.state.user?(
            <React.Fragment>
              <div id="side" style={{
                display: 'inline-block',
                margin: '20px',
                minWidth: '350px'
              }}>
                <StaticCard title="Profile">
                  <div>
                    <img 
                      src={`https://crafatar.com/avatars/${this.state.user.uuid}?overlay=true`} 
                      style = {{width:'100px', height:'100px', display:'inline-block'}}
                      alt = ''
                    />
                    <div key={this.state.user.uuid} style={{verticalAlign:'top', display:'inline-block', marginTop:'2px',marginLeft:'10px', fontSize:'17px'}}>
                      <MinecraftText style={{fontSize:'110%'}} raw={this.state.user.formattedName}/><br/>
                      <MinecraftText raw={`LVL: ${this.state.user.formattedLevel}`}/><br/>
                      <MinecraftText raw={`Gold: §6${this.state.user.currentGold.toLocaleString()}g`}/><br/>
                      <MinecraftText raw={`Played: §f${frontendTools.minutesToString(this.state.user.playtime)}`}/>
                    </div>
                  </div>
                </StaticCard>
                <StaticCard title="Status" content={
                  <div style={{fontSize:'16px'}}>
                    <MinecraftText className='text-title' style={{color:this.state.user.online?'green':'red'}} text={this.state.user.online?'Online':'Offline'}/><br/>
                    <MinecraftText text={`Last seen in pit ${frontendTools.timeSince(this.state.user.lastSave)} ago`}/><br/>
                    {this.state.user.bounty?<MinecraftText raw={`Bounty: §6${this.state.user.bounty.toLocaleString()}g`}/>:''}
                  </div>
                }/>
                <StaticCard title="Progress" content={
                  <div>
                    <ProgressBar 
                      info={this.state.user.xpProgress} 
                      item={{id:384}} type="xp" title="Prestige XP"
                    />
                    <ProgressBar 
                      info={this.state.user.goldProgress} 
                      item={{id:266}} type="gold" title="Prestige Gold"
                    />
                    <ProgressBar 
                      info={this.state.user.renownProgress} 
                      item={{id:138}} type="renown" title="Renown Shop" style={{marginBottom:'0px'}}
                    />
                  </div>
                }/>
              </div>
              <div id="main" style={{
                display: 'inline-block',
                margin: '20px',
                minWidth: '600px'
              }}>
                <TabbedCard tabs={["Inventory","Enderchest","Stash/Well"]} content={[
                  (
                    <div key={`Inventory-${this.state.user.uuid}`}>
                      <MinecraftInventory key='main' inventory={this.state.user.inventories.main} rows={4} colors={true} style={{marginRight:'3px'}}/>
                      <MinecraftInventory key='armor' inventory={this.state.user.inventories.armor} width={1} rows={4} colors={true}/>
                    </div>
                  ),(
                    <div key={`Enderchest-${this.state.user.uuid}`}>
                      <MinecraftInventory key='enderchest' inventory={this.state.user.inventories.enderchest} rows={3} colors={true}/>
                    </div>
                  ),(
                    <div key={`Stash/Well-${this.state.user.uuid}`}>
                      <MinecraftInventory key='stash' inventory={this.state.user.inventories.stash} rows={2} colors={true} style={{marginRight:'3px'}}/>
                      <MinecraftInventory key='well' style={{verticalAlign:'top'}} inventory={this.state.user.inventories.well} width={1} rows={2} colors={true}/>
                    </div>
                  )
                ]}/>
                <TabbedCard tabs={["Perk Shop","Renown Shop"]} content={[
                  (
                    <div key={`Perk-${this.state.user.uuid}`}>
                      <MinecraftInventory key='perks' inventory={this.state.user.inventories.perks} width={this.state.user.inventories.perks.length} style={{margin:'0 auto', display:'block'}}/>
                      <hr/>
                      <MinecraftInventory key='upgrades' inventory={this.state.user.inventories.upgrades} width={7} style={{margin:'0 auto', display:'block'}}/>
                    </div>
                  ),(
                    <div key={`Renown-${this.state.user.uuid}`}>
                      <MinecraftInventory key='renownshop' inventory={this.state.user.inventories.renownShop} width={7} style={{margin:'0 auto', display:'block'}}/>
                    </div>
                  )
                ]}/>
                <StaticCard title="General Stats" content={
                  <div key={`General-${this.state.user.uuid}`}>
                    <MinecraftInventory key='genstats' inventory={this.state.user.inventories.generalStats} width={this.state.user.inventories.generalStats.length} style={{margin:'0 auto', display:'block'}}/>
                  </div>
                }/>
                <NumberedCard key={this.state.user.uuid} content={this.state.user.prestiges.map(prestige=>(
                  <div>
                    {prestige.timestamp?<h2 style={{marginBottom:'10px'}}>Unlocked on {(new Date(prestige.timestamp)).toLocaleString()}</h2>:''}
                    <table style={{width:'100%'}}>
                      <tbody>
                        <tr>
                          <td><strong>Upgrade</strong></td><td><strong>Unlock time</strong></td>
                        </tr>
                        {prestige.unlocks.length>0?prestige.unlocks.slice().reverse().map((item,i)=>
                          <tr key={i}>
                            <td>{item.displayName} {item.tier||''}</td><td>{(new Date(item.timestamp)).toLocaleString()}</td>
                          </tr>
                        ):(
                          <tr>
                            <td>No Unlocks this Prestige</td><td></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}/>
              </div>
            </React.Fragment>
          ):(
            <div style={{color:"white"}}>
              {this.state.error||"Loading..."}
            </div>
          )
          }
        </div>
      </React.Fragment>
    );
  }
}

export default Player;
