const axios = require('axios');
const router = require('express').Router();
const routes = require('./routes');

// Set axios request max size
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

router.use('/api', routes);

module.exports = router;
