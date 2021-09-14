const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
// standard express logger
const morgan = require('morgan');

const routes = require('./routes');

const app = express();

// Set axios request max size
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '4000mb' }));
app.use(morgan('common'));

// Add routes
app.use('/', routes);

app.listen(80);
