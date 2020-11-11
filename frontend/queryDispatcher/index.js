const router = require('express').Router();
const routes = require('./routes');

router.use('/api', routes);

router.use((err, req, res, next) => {
  res.status(500).send({ status: 'error', message: 'QueryDispatcher Server Error' });
});

router.use((req, res, next) => {
  res.status(404).send({ status: 'error', message: 'QueryDispatcher Not Found' });
});

module.exports = router;
