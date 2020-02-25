import React from 'react';
import ItemBuilder from '../ItemBuilder/ItemBuilder';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import StaticCard from '../Cards/StaticCard';

class ItemSearch extends React.Component {
    state={lastresult:[],loading:false};
    knownUUIDS={};
    page=0;
    query=(selected)=>{
        const items = selected.filter(({key})=>key!=='none');
        const newPath = items.map(({key,tier})=>key+tier).join();
        if(newPath.length===0||this.path===newPath)return;
        this.path=newPath;
        this.page=0;
        this.setState({loading:true});
        fetch(`/api/itemSearch/${this.path}`).then(res=>res.json()).then(json => {
            if(!json.success) return;
            for(let item of json.items){
                item.item.desc.unshift('');
                item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
                if(this.knownUUIDS[item.owner]) item.item.desc.unshift('§7Owner: '+this.knownUUIDS[item.owner]);
                else item.item.desc.unshift('§7Owner: Click to request');
                item.item.uuid = item.id;
                item.item.owner = item.owner;
                item.item.checked = false;
            }
            const lastresult = json.items.map(item=>item.item);
            console.log(json);
            this.setState({lastresult,loading:false});
        });
    }
    
    requestOwner=(index)=>{
        if(index<this.state.lastresult.length&&!this.state.lastresult[index].checked){
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

    loadMore = () => {
        this.page++;
        this.setState({loading:true})
        fetch(`/api/itemSearch/${this.path}/${this.page}`).then(res=>res.json()).then(json => {
            if(!json.success) return;
            for(let item of json.items){
                item.item.desc.unshift('');
                item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
                if(this.knownUUIDS[item.owner]) item.item.desc.unshift('§7Owner: '+this.knownUUIDS[item.owner]);
                else item.item.desc.unshift('§7Owner: Click to request');
                item.item.uuid = item.id;
                item.item.owner = item.owner;
                item.item.checked = false;
            }
            const lastresult = this.state.lastresult.concat(json.items.map(item=>item.item));
            console.log(json);
            this.setState({lastresult,loading:false});
        });
    }

    render() {
        return (
            <div style={{textAlign:'center'}}>
                <h1 className="page-header">Pit Panda Mystic Search will return soon</h1>
            </div>
        )
    }
}

/*

<ItemBuilder report={this.query}/>
<div style={{display:'inline-block',textAlign:'left'}}>
    <StaticCard title="Results">
        <MinecraftInventory inventory={this.state.lastresult} onClick={this.requestOwner} colors={true}/>
        {this.state.lastresult.length%72===0&&this.state.lastresult.length!==0&&!this.state.loading?
        <div style={{margin:'auto',textAlign:'center'}}>
            <button onClick={this.loadMore} className='srchBtn'>Load More</button>
        </div>:''}
    </StaticCard>
</div>

*/

export default ItemSearch;