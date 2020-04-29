import React from 'react';
import MinecraftInventory from '../Minecraft/MinecraftInventory';
import StaticCard from '../Cards/StaticCard';
import QueryBox from '../QueryBox/QueryBox';
import getName, {cache} from '../../scripts/playerName';
import { withRouter } from 'react-router-dom';

const pageSize = 72;
class ItemSearch extends React.Component {
    state={
        results:new Array(9).fill({fake:true}),
        loading:false,
        lastsize:0,
        page:0,
        queryString:''
    };

    componentDidMount(){
        if(this.props.match.params.query) this.query(this.props.match.params.query);
        this.unlisten = this.props.history.listen((location)=>{
            this.query(location.pathname.substring('/itemsearch/'.length));
        });
    }

    componentWillUnmount(){
        this.unlisten();
    }

    query=(queryString)=>{
        if(queryString.length===0)
            return this.setState({results:new Array(9).fill({fake:true}),loading:false,lastsize:0,page:0,queryString});
        if(this.state.queryString===queryString) return;
        this.setState({loading:true,page:0,queryString});
        fetch('/api/itemsearch/'+queryString).then(res=>res.json()).then(json => {
            if(!json.success) return;
            this.readyItems(json.items);
            const result = json.items.map(item=>item.item);
            console.log(json);
            this.setState({results:result,loading:false,lastsize:result.length});
        });
    }

    updatePath=(queryString)=>this.props.history.push(`/itemsearch/${queryString}`);
    
    requestOwner= async (index)=>{
        if(!this.state.results[index].fake&&!this.state.results[index].checked){
            let results = this.state.results;
            let owner = results[index].owner;

            let targets = results.filter(item=>item.owner===owner);

            let doc = getName(owner);
            let result = doc.result;

            if(!result){
                for(let item of targets){
                    item.checked = true;
                    item.desc[0] = '§7Owner: Loading';
                }
                this.setState({results});
                result = await doc.promise;
            }
            if(result.error) {
                for(let item of targets){
                    item.checked = false;
                    item.desc[0] = '§7Owner: §4ERROR';
                }
                console.error(result.error);
            }else{
                for(let item of targets){
                    item.desc[0] = `§7Owner: ${result}`;
                }
            }
            this.setState({results});
        }
    }

    readyItems = (items) => {
        for(let item of items){
            item.item.desc.unshift('§7Lastseen: '+new Date(item.lastseen*1000).toLocaleString());
            if(cache[item.owner]&&cache[item.owner].result) {
                item.item.desc.unshift('§7Owner: '+cache[item.owner].result);
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

    directToOwner = (i,e) =>{
        e.preventDefault();
        if(this.state.results[i].fake)return;
        if(!e.ctrlKey){
            this.props.history.push(`/players/${this.state.results[i].owner}`);
        }else{
            let path = `${window.location.origin}/players/${this.state.results[i].owner}`;
            let win = window.open(path);
            win.focus();
        }
    }

    render() {
        return (
            <div style={{textAlign:'center'}}>
                <h1 className="page-header" style={{marginBottom:'200px'}}>Pit Panda Mystic Search</h1>
                <QueryBox query={this.updatePath}/>
                <div style={{display:'inline-block',textAlign:'left',margin:'20px'}}>
                    <StaticCard title="Results">
                        <MinecraftInventory style={{display:'block'}} key={this.state.queryString} inventory={this.state.results} onContextMenu={this.directToOwner} onClick={this.requestOwner} colors={true}/>
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

export default withRouter(ItemSearch);