import axios from 'axios';
import utils from './utils';
import { node_norm } from './services';

const baseRoutes = {
  /**
   * Use node normalizer post method
   * @param {object} curies object of array of curies to search for
   */
  async getNormalizedNodes(curies, cancel) {
    const config = {
      url: `${node_norm}/get_normalized_nodes`,
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
