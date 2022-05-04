import axios from 'axios';

import utils from './utils';

const routes = {
  /**
   * Get biolink model specification
   */
  async getModelSpecification() {
    let response;
    try {
      response = await axios.get('/api/biolink');
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  },
};

export default routes;
