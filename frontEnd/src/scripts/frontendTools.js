const pitMaster = require('../pitMaster.json');
const Colors = pitMaster.Extra.ColorCodes;


/**
 * Formats level like ingame
 * @param {number} prestige 
 * @param {number} level 
 * @returns {string} minecraft color formatted string
 */
function levelString(prestige,level){
    let lc = pitMaster.Pit.Levels[Math.floor(level/10)].ColorCode;
    if(prestige===0) return Colors.GRAY+'['+lc+level+Colors.RESET+Colors.GRAY+']';
    let pc=pitMaster.Pit.Prestiges[prestige].ColorCode;
    return pc+'['+Colors.YELLOW+romanNumGen(prestige)+pc+'-'+lc+level+Colors.RESET+pc+']';
} module.exports.levelString = levelString;

/**
 * Turns an time into a formatter string
 * ex: f(1234) = '20h 34m'
 * @param {number} minutes 
 * @returns {string}
 */
function minutesToString(min){
    if(min < 60) return `${min}m`;
    let str = `${Math.floor(min/60).toLocaleString()}h`;
    if(min%60!==0) str+=` ${Math.floor(min%60)}m`;
    return str;
} module.exports.minutesToString = minutesToString;

/**
 * Produces a nicely formatted string of the time since a given date in unix epoch seconds
 * @param {number} date 
 * @returns {string}
 */
function timeSince(date) { // https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval < 5) {
        return "moments";
    }
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
} module.exports.timeSince = timeSince;

/**
 * converts number to roman numeral string
 * @param {number} int
 * @returns {string} 
 */
function romanNumGen(int) { //code also in apiTools.js
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