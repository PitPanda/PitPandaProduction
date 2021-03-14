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
  const toTake = 25;
  const data = result.slice(0, toTake).map(h => {
    let asNum = parseInt(h._id);
    b = asNum % 256;
    asNum = Math.floor(asNum / 256);
    g = asNum % 256;
    asNum = Math.floor(asNum / 256);
    r = asNum % 256;

    return {
      color: `rgb(${r},${g},${b})`,
      value: h.count,
      hue: rgbToHsl(r,g,b)[0] - Math.log10(rgbToHsl(r,g,b)[2])/5,
    }
  }).sort((a,b) => a.hue - b.hue);

  const chart = ChartJSImage().chart({
    type: 'pie',
    data: {
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

  await chart.toFile('./out2.png');

  process.exit(1);
})

/**
 * TAKEN FROM https://gist.github.com/mjackson/5311256
 * 
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}


/*

ABCDEF


*/

