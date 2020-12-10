import axios from 'axios';
import yaml from 'js-yaml';

import utils from './utils';

const routes = {
  /**
   * Get biolink model specification
   */
  async getModelSpecification() {
    const config = {
      url: 'https://raw.githubusercontent.com/biolink/biolink-model/master/biolink-model.yaml',
      method: 'GET',
    };
    let response;
    try {
      response = await axios(config);
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    // Parse yaml into JSON
    try {
      return yaml.safeLoad(response.data);
    } catch (error) {
      return {
        status: 'error',
        message:
        'Failed to load Biolink model specification: could not parse YAML',
      };
    }
  },
};

export default routes;
