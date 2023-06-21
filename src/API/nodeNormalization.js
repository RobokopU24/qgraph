import axios from 'axios';
import utils from './utils';
import { api } from './baseUrlProxy';

const baseRoutes = {
  /**
   * Use node normalizer post method
   * @param {object} curies object of array of curies to search for
   */
  async getNormalizedNodes(curies, cancel) {
    const config = {
      cancelToken: cancel,
    };
    try {
      const response = await api.post('/api/node_norm', curies, config);
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return {};
      }
      return utils.handleAxiosError(error);
    }
  },
};

const routes = {
  getNormalizedNodes: baseRoutes.getNormalizedNodes,
};

export default routes;
