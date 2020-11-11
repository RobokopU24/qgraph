const router = require('express').Router();
const routes = require('./routes');

router.use('/api', routes);

const jsonErrorHandler = (req, res) => {
  res.status(500).send({ status: 'error', message: 'QueryDispatcher Server Error' });
  res.status(404).send({ status: 'error', message: 'QueryDispatcher Not Found' });
};

router.use(jsonErrorHandler);

module.exports = router;
