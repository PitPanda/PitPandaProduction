const mongoose = require('mongoose');

const PastOwnerSchema = mongoose.Schema({
    uuid: String,
    timestamp: {
      type: Date,
      default: Date.now,
  },
}, { _id: false });

module.exports = PastOwnerSchema;