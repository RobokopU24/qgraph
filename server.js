const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
// standard express logger
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// load env variables
dotenv.config();

const routes = require('./api_routes/routes');

const app = express();

const PORT = process.env.PORT || 7080;

// Set axios request max size
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

// GPT auth: 300 reqs/hr
const gptAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 300, // 300 request per window
  standardHeaders: true,
  legacyHeaders: false,
});
// GPT: 60 req/min
const gptLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 request per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '4000mb' }));
app.use('/api/gpt', gptLimiter);
app.use('/api/gpt/auth', gptAuthLimiter);
app.use(morgan('dev'));

// Add routes
app.use('/api', routes);

// Serve up static assets
app.use(express.static(path.join(__dirname, 'pack')));

// Send every request to the React app
// Define any API routes before this runs
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pack', 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🌎 ==> qgraph running on port ${PORT}!`);
});
