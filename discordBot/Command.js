
/**
 * Represents a command
 */
class Command{
    /**
     * @constructor
     * @param {{name:String,fn:Function,example:String,description:String,aliases:String[],permlevel:Number}} options
     */
    constructor({name,fn,example,description,aliases=[],permlevel=0}){
        this.name = name;
        this.fn = fn;
        this.description = description;
        this.example = example;
        this.aliases = [name,...aliases];
        this.permission = permlevel;
    }

}

/**
 * Command function
 * @callback command
 * @param {Message} msg Discord Message
 * @param {string[]} rest Arguments passed
 * @param {string=} alias Alias used to call
 */

module.exports = Command;