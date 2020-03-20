class TextHelpers {
    /**
    * converts number to roman numeral string
    * @param {number} int
    * @returns {string} 
    */
    romanNumGen(int) {
        let roman = '';
        roman += 'M'.repeat(int / 1000); int %= 1000;
        roman += 'CM'.repeat(int / 900); int %= 900;
        roman += 'D'.repeat(int / 500); int %= 500;
        roman += 'CD'.repeat(int / 400); int %= 400;
        roman += 'C'.repeat(int / 100); int %= 100;
        roman += 'XC'.repeat(int / 90); int %= 90;
        roman += 'L'.repeat(int / 50); int %= 50;
        roman += 'XL'.repeat(int / 40); int %= 40;
        roman += 'X'.repeat(int / 10); int %= 10;
        roman += 'IX'.repeat(int / 9); int %= 9;
        roman += 'V'.repeat(int / 5); int %= 5;
        roman += 'IV'.repeat(int / 4); int %= 4;
        roman += 'I'.repeat(int);
        return roman;
    }

    /**
     * converts a decimal number to hex with padded 0s
     * @param {number} n 
     * @returns {string}
     */
    toHex(n) {
        if (typeof n == "undefined") return;
        let str = n.toString(16);
        str = '0'.repeat(6 - str.length) + str;
        return str.toUpperCase();
    }

    /**
     * Formated numbers as strings
     * @param {number} n
     */
    formatNumber(n) {
        return Number(n || 0).toLocaleString();
    }

    /**
     * Formats numbers nicely ex: f(1234, 2) = 1.2k
     * @param {number} number 
     * @param {number} decPlaces 
     * @returns {string}
     */
    abbrNum(number, decPlaces) { //https://stackoverflow.com/questions/2685911/is-there-a-way-to-round-numbers-into-a-reader-friendly-format-e-g-1-1k
        // 2 decimal places => 100, 3 => 1000, etc
        decPlaces = Math.pow(10, decPlaces);

        // Enumerate number abbreviations
        var abbrev = ["k", "m", "b", "t"];

        // Go through the array backwards, so we do the largest first
        for (var i = abbrev.length - 1; i >= 0; i--) {

            // Convert array index to "1000", "1000000", etc
            var size = Math.pow(10, (i + 1) * 3);

            // If the number is bigger or equal do the abbreviation
            if (size <= number) {
                // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                // This gives us nice rounding to a particular decimal place.
                number = Math.round(number * decPlaces / size) / decPlaces;

                // Handle special case where we round up to the next abbreviation
                if ((number === 1000) && (i < abbrev.length - 1)) {
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
    }

    /**
     * Takes unformatted nbt data for enchant and formats a stirng
     * @param {Object} ench 
     * @returns {Object}
     */
    enchantFormat(ench) {
        const info = mcenchants.find(el => el.id == ench.id.value);
        if (!info) return { key: 'unknown', tier: 0 };
        return { key: info.displayName, tier: ench.lvl.value };
    }
}

module.exports = TextHelpers;