const router = require('express').Router();
const routes = require('./routes');

router.use('/api', routes);

module.exports = router;
