const request = require('request');
/**
 * Constructor for API utilty function
 */
function hypixelAPIconstructor(){
    const keys = require('./../keys');
    let i = 0;
    const getKey = () => {
        if(i==keys.length)i=0;
        return keys[i++];
    }
    return (tag => {
        return Promise.race([new Promise((resolve)=>{
            request(`https://api.hypixel.net/player?key=${getKey()}&${tag.length<32?'name':'uuid'}=${tag}`, (err, response, body)=>{
                if(err || (Math.floor(response.statusCode/100)!=2)) resolve({success:false,error:err||`API returned with code ${response.statusCode}`});
                else resolve(JSON.parse(body));
            });
        }),new Promise((resolve)=>{
            setTimeout(()=>resolve(APIerror("Request Timed Out").json),6000);
        })]);
    });
}
const tmp = hypixelAPIconstructor();
/**
 * Return an object containing the api response or error info
 * @param {string} tag UUID or Username of the user you are getting
 * @returns {Promise<Object>} JSON result of the api call
 */
const hypixelAPI = tag => tmp(tag);
module.exports.hypixelAPI = hypixelAPI;

/**
 * Generates a function to send to router to display a given error message
 * @param {string} message Error message
 * @returns {Function}
 */
function APIerror (message) {
    const json = {success:false,error:message};
    const errorFn = ((req,res)=>res.status(404).json(json));
    errorFn.toString = () => message;
    errorFn.json = json;
    return errorFn;
}
module.exports.APIerror = APIerror;

/**
 * Gets properties for an object and returns undefined if
 * it does not exist instead of erroring
 * @param {Object} object object to grab property from
 * @param  {...string} path path to get
 * @returns the value at the path from the object
 */
function getRef(object, ...path){
    if(!object) return undefined;
    if(path.length==1) return object[path[0]];
    else return getRef(object[path.shift()],...path)
} module.exports.getRef = getRef;

/**
 * converts number to roman numeral string
 * @param {number} int
 * @returns {string} 
 */
function romanNumGen(int) {
    let roman = '';
    roman +=  'M'.repeat(int / 1000);  int %= 1000; 
    roman += 'CM'.repeat(int / 900);   int %= 900; 
    roman +=  'D'.repeat(int / 500);   int %= 500;  
    roman += 'CD'.repeat(int / 400);   int %= 400;
    roman +=  'C'.repeat(int / 100);   int %= 100;
    roman += 'XC'.repeat(int / 90);    int %= 90;
    roman +=  'L'.repeat(int / 50);    int %= 50;
    roman += 'XL'.repeat(int / 40);    int %= 40;
    roman +=  'X'.repeat(int / 10);    int %= 10;
    roman += 'IX'.repeat(int / 9);     int %= 9;
    roman +=  'V'.repeat(int / 5);     int %= 5;
    roman += 'IV'.repeat(int / 4);     int %= 4;
    roman +=  'I'.repeat(int);
    return roman;
} module.exports.romanNumGen = romanNumGen;

/**
 * converts a decimal number to hex with padded 0s
 * @param {*} n 
 * @returns {string}
 */
function toHex(n){
    if(typeof n == "undefined") return;
    let str = n.toString(16);
    str+='0'.repeat(6-str.length);
    return str;
} module.exports.toHex = toHex;