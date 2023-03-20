const axios = require('axios');
const router = require('express').Router();
const yaml = require('js-yaml');

const { handleAxiosError } = require('./utils');
const services = require('./services');

router.route('/node_norm')
  .post(async (req, res) => {
    try {
      const response = await axios.post(`${services.node_norm}/get_normalized_nodes`, req.body);
      return res.send(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        return res.send({});
      }
      return res.send(handleAxiosError(error));
    }
  });

router.route('/name_resolver')
  .post(async (req, res) => {
    const config = {
      headers: {
        'Content-Type': 'text/plain',
      },
      params: {
        string: req.query.string,
        limit: req.query.limit,
      },
    };
    console.log(`${services.name_resolver}/lookup`);
    try {
      const response = await axios.post(`${services.name_resolver}/lookup`, {}, config);
      return res.send(response.data);
    } catch (error) {
      return res.send(handleAxiosError(error));
    }
  });

router.route('/biolink')
  .get(async (req, res) => {
    let response;
    try {
      response = await axios.get(services.biolink);
    } catch (error) {
      return res.status(500).send(handleAxiosError(error));
    }
    // Parse yaml into JSON
    try {
      const biolink = yaml.safeLoad(response.data);
      return res.json(biolink);
    } catch (error) {
      return res.status(500).send({
        status: 'error',
        message:
        'Failed to load Biolink model specification: could not parse YAML',
      });
    }
  });

module.exports = router;
