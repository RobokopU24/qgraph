const router = require('express').Router();
const axios = require('axios');

const robokache = require('../src/API/robokache');
const handleAxiosError = require('../src/API/utils');

const messenger = 'http://robokop.renci.org:4868';

router.route('/answer')
  .post(async (req, res) => {
    const { questionId } = req.query;
    try {
      // TODO: do we first check to see if the question is owned by user?
      let response = await robokache.getQuestionData(questionId, req.headers.authorization);
      if (response.status === 'error') {
        console.log('Unable to get query graph.');
        return res.send(response);
      }
      const query_graph = response;
      const config = {
        method: 'POST',
        url: `${messenger}/answer`,
        data: {
          message: {
            query_graph,
          },
        },
      };
      // Go ask Messenger for an answer
      response = await axios(config);
      const answer = JSON.stringify(response.data);
      // Create a new answer in Robokache
      response = await robokache.createAnswer({ parent: questionId, visibility: 1 }, req.headers.authorization);
      if (response.status === 'error') {
        console.log('Unable to create a new answer.');
        return res.send(response);
      }
      const answerId = response.id;
      response = await robokache.setAnswerData(answerId, answer, req.headers.authorization);
      if (response.status === 'error') {
        console.log('Unable to save answer.');
        return res.send(response);
      }
      return res.status(200).send({ id: answerId });
    } catch (error) {
      // TODO: can we handle this better?
      return res.status(500).send(handleAxiosError(error));
    }
  });

module.exports = router;
