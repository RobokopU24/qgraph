const router = require('express').Router();

router.route('/')
  .post(async (req, res) => {
    const { pw } = req.body;

    if (pw !== process.env.GPT_PASSWORD) {
      res.send({
        status: 'error',
        message: 'Incorrect password.',
      });
      return;
    }

    res.send({
      status: 'success',
      token: 'secretToken',
    });
  });

module.exports = router;
