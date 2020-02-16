const request = require('request');
const {Pit:{Upgrades, RenownUpgrades, Perks}} = require('../frontEnd/src/pitMaster.json');
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
 * @param {number} n 
 * @returns {string}
 */
function toHex(n){
    if(typeof n == "undefined") return;
    let str = n.toString(16);
    str='0'.repeat(6-str.length)+str;
    return str.toUpperCase();
} module.exports.toHex = toHex;

/**
 * Formated numbers as strings
 * @param {number} n
 */
function formatNumber(n){
    return Number(n||0).toLocaleString();
} module.exports.formatNumber = formatNumber;

/**
 * 
 * @param {string | object} target key or upgrade object to check
 */
function isTiered(target){
    if(typeof target === 'string') target = Upgrades[target] || RenownUpgrades[target] || Perks[target];
    return (
        (target.Levels||[]).length>1||
        getRef(target,'Extra','Formatting')=="Seperated"||
        getRef(target,'Extra','Formatting')=="Reveal"
    )
} module.exports.isTiered = isTiered;

/**
 * Formats numbers nicely ex: f(1234, 2) = 1.2k
 * @param {number} number 
 * @param {number} decPlaces 
 * @returns {string}
 */
function abbrNum(number, decPlaces) { //https://stackoverflow.com/questions/2685911/is-there-a-way-to-round-numbers-into-a-reader-friendly-format-e-g-1-1k
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number === 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
} module.exports.abbrNum = abbrNum;