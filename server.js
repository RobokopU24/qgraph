const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
// standard express logger
const morgan = require('morgan');
const path = require('path');

const routes = require('./api_routes/routes');

// load env variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 7080;

// Set axios request max size
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '4000mb' }));
app.use(morgan('common'));

// Add routes
app.use('/api', routes);

// Serve up static assets
app.use(express.static(path.join(__dirname, 'pack')));

// Send every request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'pack', 'index.html'));
});

app.listen(PORT, function() {
  console.log(`🌎 ==> qgraph running on port ${PORT}!`);
});
