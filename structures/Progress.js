const { formatNumber, abbrNum } = require('../apiTools/apiTools');
const pitMaster = require('../frontEnd/src/pitMaster.json');

const TextHelpers = require('../utils/TextHelpers');
const textHelpers = new TextHelpers();

/**
 * Progress class (used on pitpanda for progress bars)
 */
class Progress {
    /**
     * Construct a progress object
     * @param {number} displayCurrent displayed current
     * @param {number} displayGoal displayed goal
     * @param {string} specialCaseText special case text for max
     * @param {number} percentCurrent internal current
     * @param {number} percentGoal internal goal
     * @param {(number,number)=>boolean}
     */
    constructor(displayCurrent = 0, displayGoal = 0, specialCaseText, percentCurrent, percentGoal) {
        if (typeof percentCurrent === 'undefined' && typeof percentGoal === 'undefined') {
            Object.defineProperty(this, 'percentCurrent', {
                value: displayCurrent,
                enumerable: false
            });
            Object.defineProperty(this, 'percentGoal', {
                value: displayGoal,
                enumerable: false
            });
        } else {
            /**
             * internal current
             * @type {number}
             */
            this.percentCurrent = percentCurrent;
            /**
             * internal goal
             * @type {number}
             */
            this.percentGoal = percentGoal;
        }

        /**
         * displayed current
         * @type {number}
         */
        this.displayCurrent = displayCurrent;

        /**
         * displayed goal
         * @type {number}
         */
        this.displayGoal = displayGoal;

        this.percent = this.percentCurrent / this.percentGoal;
        this.description = `${textHelpers.abbrNum(this.displayCurrent, 2)}`;
        if (this.displayGoal) this.description += `/${textHelpers.abbrNum(this.displayGoal, 2)}`;
        if (specialCaseText) this.message = specialCaseText;
    }
}

module.exports = Progress;