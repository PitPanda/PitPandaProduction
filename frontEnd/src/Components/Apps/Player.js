import React from 'react';
import StaticCard from '../Cards/StaticCard';
import TabbedCard from '../Cards/TabbedCard';
import NumberedCard from '../Cards/NumberedCard';
import MinecraftText from '../Minecraft/MinecraftText';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import ProgressBar from '../ProgressBar/ProgressBar';
import PlayerForm from './PlayerForm';

class Player extends React.Component {
  state = {user:null};

  componentDidMount(){
    this.loadUser(`/players/${(this.props.match.params.id||'').trim()}`);
    this.props.history.listen((location,action,c)=>{
      this.loadUser(location.pathname);
    });
  }

  loadUser = (path) => {
    fetch(`/api${path}`).then(res=>res.json()).then(json => {
      console.log(json);
      if(json.success) this.setState({user:json.data,error:undefined});
      else this.setState({error:json.error,user:undefined});
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
                <StaticCard title="Profile" content={
                  <div>
                    <img 
                      src={`https://crafatar.com/avatars/${this.state.user.uuid}?overlay=true`} 
                      style = {{width:'100px', height:'100px', display:'inline-block'}}
                      alt = ''
                    />
                    <div style={{verticalAlign:'top', display:'inline-block', marginTop:'2px',marginLeft:'10px', fontSize:'17px'}}>
                      <MinecraftText style={{fontSize:'110%'}} raw={this.state.user.formatted.name}/><br/>
                      <MinecraftText raw={`LVL: ${this.state.user.formatted.level}`}/><br/>
                      <MinecraftText raw={`Gold: ${this.state.user.formatted.gold}`}/><br/>
                      <MinecraftText raw={`Played: ${this.state.user.formatted.playtime}`}/>
                    </div>
                  </div>
                }/>
                <StaticCard title="Status" content={
                  <div style={{fontSize:'16px'}}>
                    <MinecraftText className='text-title' style={{color:this.state.user.status.online?'green':'red'}} text={this.state.user.status.online?'Online':'Offline'}/><br/>
                    <MinecraftText text={this.state.user.status.lastseen}/><br/>
                    {this.state.user.formatted.bounty?<MinecraftText raw={`Bounty: ${this.state.user.formatted.bounty}`}/>:''}
                  </div>
                }/>
                <StaticCard title="Progress" content={
                  <div>
                    <ProgressBar info={this.state.user.progress.xp} item={{id:384}} type="xp" title="Prestige XP" style={{marginBottom:'10px'}}/>
                    <ProgressBar info={this.state.user.progress.gold} item={{id:266}} type="gold" title="Prestige Gold" style={{marginBottom:'10px'}}/>
                    <ProgressBar info={this.state.user.progress.renown} item={{id:138}} type="renown" title="Renown Shop"/>
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
                      <MinecraftInventory key='main' inventory={this.state.user.inventories.main} colors={true} style={{marginRight:'3px'}}/>
                      <MinecraftInventory key='armor' inventory={this.state.user.inventories.armor} colors={true}/>
                    </div>
                  ),(
                    <div key={`Enderchest-${this.state.user.uuid}`}>
                      <MinecraftInventory key='enderchest' inventory={this.state.user.inventories.enderchest} colors={true}/>
                    </div>
                  ),(
                    <div key={`Stash/Well-${this.state.user.uuid}`}>
                      <MinecraftInventory key='stash' inventory={this.state.user.inventories.stash} colors={true} style={{marginRight:'3px'}}/>
                      <MinecraftInventory key='well' style={{verticalAlign:'top'}} inventory={{items:this.state.user.inventories.well1.items.concat(this.state.user.inventories.well2.items),width:1,slots:2}} colors={true}/>
                    </div>
                  )
                ]}/>
                <TabbedCard tabs={["Perk Shop","Renown Shop"]} content={[
                  (
                    <div key={`Perk-${this.state.user.uuid}`}>
                      <MinecraftInventory key='perks' inventory={this.state.user.inventories.perks} style={{margin:'0 auto', display:'block'}}/>
                      <hr/>
                      <MinecraftInventory key='upgrades' inventory={this.state.user.inventories.upgrades} style={{margin:'0 auto', display:'block'}}/>
                    </div>
                  ),(
                    <div key={`Renown-${this.state.user.uuid}`}>
                      <MinecraftInventory key='renownshop' inventory={this.state.user.inventories.renownshop} style={{margin:'0 auto', display:'block'}}/>
                    </div>
                  )
                ]}/>
                <StaticCard title="General Stats" content={
                  <div key={`General-${this.state.user.uuid}`}>
                    <MinecraftInventory key='genstats' inventory={this.state.user.inventories.genstats} style={{margin:'0 auto', display:'block'}}/>
                  </div>
                }/>
                <NumberedCard key={this.state.user.uuid} content={this.state.user.prestiges.map(items=>
                  <table style={{width:'100%'}}>
                    <tbody>
                      <tr>
                        <td><strong>Upgrade</strong></td><td><strong>Unlock time</strong></td>
                      </tr>
                      {items.length>0?items.slice().reverse().map((item,i)=>
                        <tr key={i}>
                          <td>{item.display}{item.tier===-1?``:` ${item.tier+1}`}</td><td>{(new Date(item.acquireDate)).toLocaleString()}</td>
                        </tr>
                      ):(
                        <tr>
                          <td>No Unlocks this Prestige</td><td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}/>
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
