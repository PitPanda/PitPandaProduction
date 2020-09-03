import React from 'react';
import StaticCard from '../Cards/StaticCard';
import TabbedCard from '../Cards/TabbedCard';
import NumberedCard from '../Cards/NumberedCard';
import MinecraftText from '../Minecraft/MinecraftText';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import ProgressBar from '../ProgressBar/ProgressBar';
import Header from '../Header/Header';
import PlayerList from '../PlayerList/PlayerList';
import LeaderboardPositions from '../LeaderboardPositions/LeaderboardPositions';
import frontendTools from '../../scripts/frontendTools';
import { withRouter } from 'react-router-dom';

const upperFirst = str => str.charAt(0).toUpperCase() + str.substring(1);

class Player extends React.Component {
  state = {user:null,alive:true,hiddens:false};

  componentDidMount(){
    this.loadUser(`/players/${(this.props.match.params.id||'').trim()}`);
    this.unlisten = this.props.history.listen((location)=>{
      this.loadUser(location.pathname);
    });
  }

  componentWillUnmount(){
    this.setState({alive:false});
    this.unlisten();
  }

  loadUser = (path) => {
    if(!path.startsWith('/players/'))return;
    fetch(`/api${path}`).then(res=>res.json()).then(json => {
      console.log(json);
      if(json.success && this.state.alive) {
        this.setState({user:json.data,error:undefined});
      } else this.setState({error:json.error,user:undefined});
    }).catch((err)=>{
      if(this.state.alive) this.setState({error:err,user:undefined});
      console.log(err);
    });
  }

  render() {
    return (
      <React.Fragment>
        <Header history={this.props.history}/>
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
                    <div key={this.state.user.uuid} style={{verticalAlign:'top', display:'inline-block', marginTop:'7px',marginLeft:'10px', fontSize:'17px'}}>
                      <MinecraftText style={{fontSize:'110%'}} raw={this.state.user.formattedName}/><br/>
                      <MinecraftText raw={`Level: ${this.state.user.formattedLevel}`}/><br/>
                      <MinecraftText raw={`Gold: §6${this.state.user.currentGold.toLocaleString()}g`}/><br/>
                      <MinecraftText raw={`Played: §f${frontendTools.minutesToString(this.state.user.playtime)}`}/>
                    </div>
                  </div>
                </StaticCard>
                {this.state.user.displays.map((display,i,a) => {
                  const key = `${this.state.user.uuid}-${display.display_type}-${i}`;
                  switch(display.display_type){
                    case 'flag': {
                      return (
                        <StaticCard title={upperFirst(display.type)} key={key} >
                          <div style={{maxWidth:'300px'}}>
                            This player has been marked as {display.type} by the <a href="https://discord.gg/CdTmYrG">Trade Center Discord</a> staff.
                            {display.notes?<><br/><br/>Trade Center Staff notes:<br/> {display.notes}</>:''}
                            {display.discordid?<><br/><br/>Discord ID: <br/>{display.discordid}</>:''}
                            {(display.alts&&display.alts.length)?<><br/><br/>Alts:<br/><PlayerList players={display.alts.map(alt=>({tag:alt}))} instant={true} /></>:''}
                            {display.main?<><br/><br/>Main:<br/><PlayerList players={[{tag:display.main}]} instant={true} /></>:''}
                          </div>
                        </StaticCard>
                      );
                    }
                    case 'plaque': {
                      return (
                        <StaticCard title={display.title} key={key}>
                          <div style={{maxWidth:'300px'}}>
                            {(display.description||[]).map((seg,i) => {
                              switch (seg.type){
                                case 'text':
                                  return (
                                    <div style={{paddingBottom:'5px'}} key={`${key}-${i}`}>
                                      {seg.content.split('\\n').map((str, i2) => <p style={{marginBottom:'5px'}} key={`${key}-${i}-${i2}`}>{str}</p>)}
                                    </div>
                                  )
                                case 'link':
                                  return <React.Fragment key={`${key}-${i}`}><a href={seg.url} style={{marginBottom:'10px',display:'block'}}>{seg.title || seg.url}</a></React.Fragment>
                                default:
                                  return '';
                              }
                            })}
                            {(display.alts&&display.alts.length)?<><br/><br/>Alts:<br/><PlayerList players={display.alts.map(alt=>({tag:alt}))} instant={true} /></>:''}
                            {display.main?<><br/><br/>Main:<br/><PlayerList players={[{tag:display.main}]} instant={true} /></>:''}
                          </div>
                        </StaticCard>
                      );
                    }
                    default:
                      return '';
                  }
                })}
                <StaticCard title="Status" content={
                  <div style={{fontSize:'16px'}}>
                    <MinecraftText className='text-title' style={{color:this.state.user.online?'green':'red'}} text={this.state.user.online?'Online':'Offline'}/><br/>
                    <MinecraftText text={`Last seen in The Pit ${frontendTools.timeSince(this.state.user.lastSave)} ago`}/><br/>
                    {this.state.user.online ? '' : <><MinecraftText text={`Last seen on Hypixel ${frontendTools.timeSince(this.state.user.lastLogout)} ago`}/><br/></>}
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
                <StaticCard title={<>Leade<span onClick={()=>this.setState({hiddens:!this.state.hiddens})}>r</span>board Positions</>} key={'positions'+this.state.user.uuid}>
                  <LeaderboardPositions uuid={this.state.user.uuid} hiddens={this.state.hiddens}/>
                </StaticCard>
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
                      <MinecraftInventory key='killstreaks' inventory={this.state.user.inventories.killstreaks} width={this.state.user.inventories.killstreaks.length} style={{margin:'0 auto', display:'block'}}/>
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
                <NumberedCard key={this.state.user.uuid} content={this.state.user.prestiges.map((prestige,index)=>(
                  <div>
                    {prestige.timestamp?<h3 style={{marginBottom:'10px'}}>Unlocked on {(new Date(prestige.timestamp)).toLocaleString()}</h3>:''}
                    {prestige.gold&&this.state.user.prestiges.length-1!==index?<h3 style={{marginBottom:'10px'}}>Completed with {frontendTools.abbrNum(prestige.gold,2)} gold earned</h3>:''}
                    <table style={{width:'100%'}}>
                      <tbody>
                        <tr>
                        <td><strong>Type</strong></td><td><strong>Upgrade</strong></td><td><strong>Unlock time</strong></td>
                        </tr>
                        {prestige.unlocks.length>0?prestige.unlocks.slice().reverse().map((item,i)=>
                          <tr key={i}>
                            <td>{item.type}</td><td>{item.displayName} {(typeof item.tier === 'number')?item.tier+1:''}</td><td>{(new Date(item.timestamp)).toLocaleString()}</td>
                          </tr>
                        ):(
                          <tr>
                            <td>No Unlocks this Prestige</td><td></td><td></td>
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

export default withRouter(Player);
