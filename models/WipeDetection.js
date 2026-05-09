const mongoose = require('mongoose');

const WipeDetectionSchema = mongoose.Schema({
    uuid: { type: String, required: true, index: true },
    name: String,
    detectedAt: { type: Date, default: Date.now, index: true },
    before: {
        prestige: Number,
        playtime: Number,
        xp: Number,
        lifetimeGold: Number,
    },
    after: {
        prestige: Number,
        playtime: Number,
        xp: Number,
        lifetimeGold: Number,
    },
});

module.exports = mongoose.model('WipeDetections', WipeDetectionSchema);
