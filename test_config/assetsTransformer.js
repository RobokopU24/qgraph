const path = require('path');

// https://github.com/facebook/jest/issues/2663#issuecomment-317109798
module.exports = {
  process(src, filename) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  },
};
