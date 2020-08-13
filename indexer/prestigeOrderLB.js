const mongoose = require('mongoose');
const Player = require('../models/Player');
const fs = require('fs');

const { dbLogin, Development } = require('../settings.json');

mongoose.connect(dbLogin, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('MongoDB Connected'));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('autoIndex', Development);

const [log, finalize] = (()=>{
  let output = '';
  return [
    str => {
      console.log(str);
      output += str + '\n';
    },
    () => fs.writeFileSync('out.txt', output),
  ]
})();

(async()=>{
  for(let i = 0; i < 35; i++){
    log(`First players to reach prestige ${i+1}:`);
    const result = await Player.aggregate([
      {
        $match: {
          exempt: {
            $exists: false
          }
        }
      }, {
        $project: {
          prestigeTimes: 1,
          name: 1,
        }
      }, {
        $unwind: {
          path: '$prestigeTimes',
          includeArrayIndex: 'prestigeIndex',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          prestigeIndex: i,
        }
      }, {
        $project: {
          prestigeTimes: 1,
          name: 1
        }
      }, {
          $sort: {  
          prestigeTimes: 1
        }
      }, {
        $limit: 10
      }
    ]);
    result.slice(0,10).forEach(({name},position)=>log(`\t#${position+1} ${name}`));
  }
  finalize();
})();
