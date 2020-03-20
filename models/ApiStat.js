const mongoose = require('mongoose');

const apiStatSchema = mongoose.Schema({
    count: Number,
    date: {
        type: Number,
        default: () => Math.floor(Date.now() / 86400e3)
    }
});

let knownModels = {};
/**
 * gets collection for api path
 * @param {string} path
 * @returns {Model<Document, {}>}
 */
function ApiStat(path) {
    if (!knownModels[path]) {
        const model = mongoose.model(path, apiStatSchema);
        knownModels[path] = model;
    }
    return knownModels[path];
}

module.exports = ApiStat;