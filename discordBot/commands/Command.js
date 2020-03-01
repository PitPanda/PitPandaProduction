
/**
 * Represents a command
 */
class Command{
    /**
     * Construct a new command
     * @param {string} name common name
     * @param {command} fn command itself
     * @param {{description:string,example:string}} info description for the help command
     * @param {string[]=} aliases aliases for the command
     */
    constructor(name,fn,info,aliases=[]){
        this.name = name;
        this.fn = fn;
        this.info = info;
        this.aliases = [name,...aliases];
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