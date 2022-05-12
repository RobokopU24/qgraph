const router = require('express').Router();
const axios = require('axios');

const robokache = require('./robokache');
const { handleAxiosError } = require('./utils');
const services = require('./services');
const external_apis = require('./external');

router.use('/', external_apis);

router.use('/robokache', robokache.router);

router.route('/quick_answer')
  .post(async (req, res) => {
    const { ara } = req.query;
    const ara_url = services[ara];
    const config = {
      method: 'POST',
      url: ara_url,
      data: req.body,
      transformResponse: [(data) => data],
    };

    let answer;
    try {
      // Go ask ARA for an answer
      const response = await axios(config);

      // Validate json
      try {
        answer = JSON.parse(response.data);
        res.send(answer);
      } catch (error) {
        res.send({
          status: 'error',
          message: `Recieved unparseable JSON response from ${ara}`,
        });
      }
    } catch (err) {
      res.send(handleAxiosError(err));
    }
  });

router.route('/answer')
  .post(async (req, res) => {
    const { questionId, ara } = req.query;
    try {
      let response = await robokache.routes.getQuestionData(questionId, req.headers.authorization);
      if (response.status === 'error') {
        return res.send(response);
      }
      const message = response;
      const ara_url = services[ara];
      const config = {
        method: 'POST',
        url: ara_url,
        data: message,
        // don't parse the response
        transformResponse: [(data) => data],
      };

      let answer;
      try {
        // Go ask ARA for an answer
        response = await axios(config);

        // Validate json
        try {
          answer = JSON.parse(response.data);
        } catch (error) {
          answer = {
            status: 'error',
            message: `Recieved unparseable JSON response from ${ara}`,
          };
        }
      } catch (err) {
        // Save error in robokache
        answer = handleAxiosError(err);
      }

      // Create a new answer in Robokache
      response = await robokache.routes.createAnswer({ parent: questionId, visibility: 2 }, req.headers.authorization);
      if (response.status === 'error') {
        return res.send(response);
      }
      const answerId = response.id;
      response = await robokache.routes.setAnswerData(answerId, answer, req.headers.authorization);
      if (response.status === 'error') {
        return res.send(response);
      }
      return res.status(200).send({ id: answerId });
    } catch (error) {
      // TODO: can we handle this better?
      return res.status(500).send(handleAxiosError(error));
    }
  });

module.exports = router;
