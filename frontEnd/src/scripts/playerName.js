export let cache = {};
function getDoc(tag){
    if(cache[tag]) return cache[tag];
    const promise = new Promise(async resolve => {
        try{
            const request = await fetch(`/api/username/${tag}`);
            const json = await request.json();
            console.log(json);
            if(!json.success) resolve({error:(json.error||'An error has occured')});
            else {
                cache[tag].result = json.name;
                resolve(json.name);
            } 
        }catch(e){
            resolve({error:e});
        }
    });
    cache[tag]={promise};
    return cache[tag];
}

export default getDoc;