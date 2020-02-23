import React from 'react';
import ItemBuilder from '../ItemBuilder/ItemBuilder';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import StaticCard from '../Cards/StaticCard';

class ItemSearch extends React.Component {
    state={lastresult:[],loading:false};
    page=0;
    query=(selected)=>{
        const items = selected.filter(({key})=>key!=='none');
        this.path = items.map(({key,tier})=>key+tier).join();
        if(this.path.length===0)return;
        this.setState({loading:true})
        fetch(`/api/itemSearch/${this.path}`).then(res=>res.json()).then(json => {
            for(let item of json){
                item.item.desc.unshift('');
                item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
                item.item.desc.unshift('§7Owner: Click to request');
                item.item.uuid = item.id;
                item.item.owner = item.owner;
                item.item.checked = false;
            }
            const lastresult = json.map(item=>item.item);
            console.log(json);
            this.setState({lastresult,loading:false});
        });
    }
    
    requestOwner=(index)=>{
        if(!this.state.lastresult[index].checked){
            let lastresult = this.state.lastresult;
            lastresult[index].desc[0] = '§7Owner: Loading';
            this.setState({lastresult});
            fetch(`/api/username/${this.state.lastresult[index].owner}`).then(res=>res.json()).then(json => {
                lastresult[index].checked = true;
                lastresult[index].desc[0] = '§7Owner: '+json.formatted;
                this.setState({lastresult});
            });
        }
    }

    loadMore = () => {
        this.page++;
        this.setState({loading:true})
        fetch(`/api/itemSearch/${this.path}/${this.page}`).then(res=>res.json()).then(json => {
            for(let item of json){
                item.item.desc.unshift('');
                item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
                item.item.desc.unshift('§7Owner: Click to request');
                item.item.uuid = item.id;
                item.item.owner = item.owner;
                item.item.checked = false;
            }
            const lastresult = this.state.lastresult.concat(json.map(item=>item.item));
            console.log(json);
            this.setState({lastresult,loading:false});
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
                        {this.state.lastresult.length%36===0&&this.state.lastresult.length!==0&&!this.state.loading?
                        <div style={{margin:'auto',textAlign:'center'}}>
                            <button onClick={this.loadMore} className='srchBtn'>Load More</button>
                        </div>:''}
                    </StaticCard>
                </div>
            </div>
        )
    }
}

export default ItemSearch;