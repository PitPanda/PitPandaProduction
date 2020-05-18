import { minutesToString } from './frontendTools';
import pitMaster from '../pitMaster.json';
 
function toString(n) {
    return toFixed(0)(n);
}

function toFixed(places) {
    return (n) => {
        if (typeof n === 'number') return n.toLocaleString('en-US', {
            minimumFractionDigits: places,
            maximumFractionDigits: places,
        });
        else return n + '';
    }
}

function toPercent(num) {
    return toFixed(1)(num * 100) + '%';
}


const methods = {
    ownKeys(hidden) {
        let entries = Object.entries(this)
        if (!hidden) entries = entries.filter(([, { hidden }]) => !hidden)
        return entries.sort((a, b) => a[1].short < b[1].short ? -1 : 1).map(e => e[0]);
    },
};

const funBigMap = {
    toString,
    toFixed:toFixed(2),
    minutesToString,
    toPercent
};

const boards = new Proxy( pitMaster.Extra.Leaderboards ,{
    get: (target, prop) => {
        if (prop in methods) return methods[prop].bind(target);
        if (!(prop in target)) prop = 'error';
        return new Proxy(target[prop], {
            get: (subTarget, subProp) => {
                if (subProp === "transform") return funBigMap[subTarget[subProp]] || funBigMap[target.default[subProp]];
                if (subProp in subTarget) return subTarget[subProp];
                else return target.default[subProp];
            }
        });
    },
});

export default boards;