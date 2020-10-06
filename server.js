const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const queryDispatcher = require('./queryDispatcher');

const PORT = process.env.PORT || 80;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '4000mb' }));

if (process.env.HOT_RELOAD) {
  console.log('Hot reloading');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.refresh.js');
  const compiler = webpack(webpackConfig);

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath,
  }));
  app.use(require('webpack-hot-middleware')(compiler));
} else {
  console.log('No hot reloading');
  app.use(express.static('pack'));
}

// These are api routes
app.use(queryDispatcher);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pack/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
