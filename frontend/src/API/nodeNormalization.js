import axios from 'axios';
import utils from './utils';

const baseUrl = `${window.location.origin}/api/external/nodeNormalization`;

const baseRoutes = {
  /**
   * Use node normalizer post method
   * @param {object} curies object of array of curies to search for
   */
  async getNormalizedNodes(curies, cancel) {
    const config = {
      url: `${baseUrl}/get_normalized_nodes`,
      method: 'POST',
      data: curies,
      cancelToken: cancel,
    };
    try {
      const response = await axios.request(config);
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
