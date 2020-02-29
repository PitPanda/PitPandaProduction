import React from 'react';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import StaticCard from '../Cards/StaticCard';
import QueryBox from '../QueryBox/QueryBox';

const pageSize = 72;
class ItemSearch extends React.Component {
    state={
        results:[],
        loading:false,
        lastsize:0,
        knownUUIDS:{},
        page:0,
        queryString:''
    };

    query=(queryString)=>{
        console.log(queryString);
        if(queryString.length===0||this.queryString===queryString)return;
        this.setState({loading:true,page:0,queryString});
        fetch(`/api/itemSearch/${queryString}`).then(res=>res.json()).then(json => {
            if(!json.success) return;
            this.readyItems(json.items);
            const result = json.items.map(item=>item.item);
            console.log(json);
            this.setState({results:result,loading:false,lastsize:result.length});
        });
    }
    
    requestOwner=(index)=>{
        if(!this.state.results[index].fake&&!this.state.results[index].checked){
            let results = this.state.results;
            let owner = results[index].owner;
            let knownUUIDS = this.state.knownUUIDS;
            let targets = results.filter(item=>item.owner===owner);
            for(let item of targets){
                item.desc[0] = '§7Owner: Loading';
            }
            this.setState({results});
            fetch(`/api/username/${owner}`).then(res=>res.json()).then(json => {
                console.log(json);
                if(json.success){
                    for(let item of targets){
                        item.checked = true;
                        item.desc[0] = '§7Owner: '+json.leveled;
                    }
                    knownUUIDS[owner]=json.leveled;
                }else{
                    for(let item of targets){
                        item.desc[0] = '§7Owner: §4ERROR';
                    }
                }
                this.setState({results,knownUUIDS});
            });
        }
    }

    readyItems = (items) => {
        for(let item of items){
            item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
            if(this.state.knownUUIDS[item.owner]) {
                item.item.desc.unshift('§7Owner: '+this.state.knownUUIDS[item.owner]);
                item.item.checked = true;
            }
            else {
                item.item.desc.unshift('§7Owner: Click to request');
                item.item.checked = false;
            }
            item.item.uuid = item.id;
            item.item.owner = item.owner;
        }
    }

    loadMore = () => {
        this.setState({loading:true,page:this.state.page+1})
        fetch(`/api/itemSearch/${this.state.queryString}/${this.state.page+1}`).then(res=>res.json()).then(json => {
            if(!json.success) return;
            this.readyItems(json.items);
            let results = this.state.results;
            results = results.concat(json.items.map(item=>item.item));
            console.log(json);
            this.setState({results,loading:false,lastsize:json.items.length});
        });
    }

    render() {
        return (
            <div style={{textAlign:'center'}}>
                <h1 className="page-header" style={{marginBottom:'200px'}}>Pit Panda Mystic Search (Alpha)</h1>
                <QueryBox query={this.query}/>
                <div style={{display:'inline-block',textAlign:'left',margin:'20px'}}>
                    <StaticCard title="Results">
                        <MinecraftInventory style={{display:'block'}} key={this.state.queryString} inventory={this.state.results} onClick={this.requestOwner} colors={true}/>
                        {this.state.lastsize===pageSize&&this.state.results.length!==0&&!this.state.loading?
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