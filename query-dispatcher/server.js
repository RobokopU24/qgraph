const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();

// Set axios request max size
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '4000mb' }));

// Add routes
app.use('/', routes);

app.listen(80);
