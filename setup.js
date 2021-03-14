const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config()

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', process.env.ENV === 'DEV');
