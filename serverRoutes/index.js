const router = require('express').Router();
const axios = require('axios');
const apiRoutes = require('./apiRoutes');
const url = require('../controllers/url');

const messenger = 'http://robokop.renci.org:4868';

router.route('/api/get_answers')
  .post((req, res) => {
    const { question_id } = req.query;
    let config = {
      method: 'get',
      url: url(`api/document/${question_id}/data`),
      headers: {
        Accept: 'application/json',
      },
    };
    if (req.headers.authorization) {
      config.headers.Authorization = req.headers.authorization;
    }
    // get query graph from robokache
    axios.request(config)
      .then((response) => {
        console.log('Query graph', response.data);
        axios.request({
          method: 'post',
          url: `${messenger}/answer`,
          data: {
            message: {
              query_graph: response.data,
            },
          },
        })
          .then((r) => {
            config = {
              method: 'post',
              url: url(`api/document/${question_id}/children`),
              data: r.data,
              headers: {
                'Content-Type': 'application/json',
              },
              maxBodyLength: 10000000000,
              maxContentLength: 10000000000,
            }
            if (req.headers.authorization) {
              config.headers.Authorization = req.headers.authorization;
            }
            axios.request(config)
              .then((success) => {
                res.send(r.data);
              })
              .catch((fail) => {
                console.log('Failed to save answer', fail);
              });
          })
          .catch((err) => {
            res.status(err.response.status).send(err);
          });
      })
      .catch((error) => {
        console.log('Failed to get query graph', error);
      });
  });

router.use('/api', apiRoutes);

module.exports = router;
