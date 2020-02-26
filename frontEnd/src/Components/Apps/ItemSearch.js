import React from 'react';
import ItemBuilder from '../ItemBuilder/ItemBuilder';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import StaticCard from '../Cards/StaticCard';

class ItemSearch extends React.Component {
    state={lastresult:[],loading:false,lastsize:0};
    knownUUIDS={};
    page=0;
    query=(queryString)=>{
        if(queryString.length===0||this.queryString===queryString)return;
        this.queryString=queryString;
        this.page=0;
        this.setState({loading:true});
        fetch(`/api/itemSearch/${queryString}`).then(res=>res.json()).then(json => {
            if(!json.success) return;
            this.readyItems(json.items);
            const lastresult = json.items.map(item=>item.item);
            console.log(json);
            this.setState({lastresult,loading:false,lastsize:json.items.length});
        });
    }
    
    requestOwner=(index)=>{
        if(!this.state.lastresult[index].fake&&!this.state.lastresult[index].checked){
            let lastresult = this.state.lastresult;
            let owner = lastresult[index].owner;
            let targets = lastresult.filter(item=>item.owner===owner);
            for(let item of targets){
                item.desc[0] = '§7Owner: Loading';
            }
            if(this.knownUUIDS[owner]){
                for(let item of targets){
                    item.checked = true;
                    item.desc[0] = '§7Owner: '+this.knownUUIDS[owner];
                }
                return this.setState({lastresult});
            }
            this.setState({lastresult});
            fetch(`/api/username/${owner}`).then(res=>res.json()).then(json => {
                console.log(json);
                if(json.success){
                    for(let item of targets){
                        item.checked = true;
                        item.desc[0] = '§7Owner: '+json.leveled;
                    }
                    this.knownUUIDS[owner]=json.leveled;
                }else{
                    for(let item of targets){
                        item.desc[0] = '§7Owner: §4ERROR';
                    }
                }
                this.setState({lastresult});
            });
        }
    }

    readyItems = (items) => {
        for(let item of items){
            item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
            if(this.knownUUIDS[item.owner]) item.item.desc.unshift('§7Owner: '+this.knownUUIDS[item.owner]);
            else item.item.desc.unshift('§7Owner: Click to request');
            item.item.uuid = item.id;
            item.item.owner = item.owner;
            item.item.checked = false;
        }
    }

    loadMore = () => {
        this.page++;
        this.setState({loading:true})
        fetch(`/api/itemSearch/${this.queryString}/${this.page}`).then(res=>res.json()).then(json => {
            if(!json.success) return;
            this.readyItems(json.items);
            const lastresult = this.state.lastresult.concat(json.items.map(item=>item.item));
            console.log(json);
            this.setState({lastresult,loading:false,lastsize:json.items.length});
        });
    }

    render() {
        return (
            <div style={{textAlign:'center'}}>
                <h1 className="page-header">Pit Panda Mystic Search (Alpha)</h1>
                <ItemBuilder report={this.query}/>
                <div style={{display:'inline-block',textAlign:'left'}}>
                    <StaticCard title="Results">
                        <MinecraftInventory inventory={this.state.lastresult} onClick={this.requestOwner} colors={true}/>
                        {this.state.lastsize===72&&this.state.lastresult.length!==0&&!this.state.loading?
                        <div style={{margin:'auto',textAlign:'center'}}>
                            <button onClick={this.loadMore} className='srchBtn'>Load More</button>
                        </div>:''}
                    </StaticCard>
                </div>
            </div>
        )
    }
}

/*

<input type="text" id="query" onKeyPress={e=>{
                    if(e.key==='Enter') this.query(e.target.value);
                }} />

*/

export default ItemSearch;