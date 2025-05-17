const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config()

const connectionPromise = mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDB Connected');
    return mongoose;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    throw err;
  });

mongoose.set('autoIndex', process.env.ENV === 'DEV');

module.exports = connectionPromise;
