import utils from './utils';
import { api } from './baseUrlProxy';

const routes = {
  /**
   * Get biolink model specification
   */
  async getModelSpecification() {
    let response;
    try {
      response = await api.get('/api/biolink');
    } catch (error) {
      return utils.handleAxiosError(error);
    }
    return response.data;
  },
};

export default routes;
