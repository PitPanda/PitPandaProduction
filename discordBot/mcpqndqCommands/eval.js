const Command = require('../Command');

function command(msg){
    let code = msg.content.substring(msg.content.indexOf("```js\n")+6,msg.content.lastIndexOf("```"));
    try{
        msg.channel.send("Returned:\n" + JSON.stringify(eval("func();function func(){"+code+"}")));
    }catch(e){
        msg.channel.send(e.toString());
    }
}

module.exports = new Command({
    name:'eval',
    fn:command,
    description:'Run code',
    example:`**$eval \\\`\\\`\\\`js code\\\`\\\`\\\`**`,
    permlevel: Infinity
});