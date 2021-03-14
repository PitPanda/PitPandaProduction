require('../../setup');
const Players = require('../../models/Player');
const ChartJSImage = require('chart.js-image');

Players.aggregate([
  {
    '$match': {
      'hatColor': {
        '$exists': true
      }
    }
  }, {
    '$group': {
      '_id': '$hatColor', 
      'count': {
        '$sum': 1
      }
    }
  }, {
    '$sort': {
      'count': -1
    }
  }
]).exec().then(async result => {
  console.log(result);
  const toTake = 376;
  const totalHats = result.reduce((a, c) => a + c.count, 0);
  const otherHats = result.slice(toTake).reduce((a, c) => a + c.count, 0);
  const data = [
    ...result.slice(0, toTake).map(h => {
      let asNum = parseInt(h._id);
      b = asNum % 256;
      asNum = Math.floor(asNum / 256);
      g = asNum % 256;
      asNum = Math.floor(asNum / 256);
      r = asNum % 256;

      return {
        color: `rgb(${r},${g},${b})`,
        value: h.count
      }
    }),
    {
      color: 'rgb(128,128,128)',
      value: otherHats,
    },
  ]

  const chart = ChartJSImage().chart({
    type: 'pie',
    data: {
      //labels: data.map(h => `${(h.value/totalHats*100).toFixed(2)}%`),
      datasets: [{
        label: 'Player Hat Colors',
        data: data.map(o => o.value),
        backgroundColor: data.map(o => o.color),
        borderWidth: 0,
      }]
    }
  })
  .width(1200)
  .height(1200);

  await chart.toFile('./out.png');

  process.exit(1);
})
