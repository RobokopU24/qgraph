import axios from 'axios';
import handleAxiosError from './utils';

const baseUrl = `${window.location.origin}/api/external/nodeNormalization`;

const baseRoutes = {
  /**
   * Given curies, get information about them
   */
  async getNormalizedNodes(curies) {
    // Params need to be in the format curie=a&curie=b&curie=c
    // which is not supported by axios
    // so we build this with URLSearchParams
    const params = new URLSearchParams();
    curies.forEach((c) => params.append('curie', c))

    const config = {
      url: `${baseUrl}/get_normalized_nodes`,
      method: 'GET',
      params,
    };
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
};

const routes = {
  getNormalizedNodes: baseRoutes.getNormalizedNodes,
};

export default routes;
