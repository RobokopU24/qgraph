const router = require('express').Router();

router.route('/auth')
  .post(async (req, res) => {
    const { pw } = req.body;

    if (pw !== process.env.GPT_PASSWORD) {
      res.send({
        status: 'error',
        message: 'Incorrect password.',
      });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    res.send({
      status: 'success',
      token: 'secretToken',
    });
  });

module.exports = router;
