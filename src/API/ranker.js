import axios from 'axios';
import utils from './utils';

const ranker = 'http://robokop.renci.org:6011/api';

const baseRoutes = {
  /**
   * Look up possible entities using a search string
   */
  async entityLookup(entity_name) {
    const config = {
      headers: {
        'Content-Type': 'text/plain',
      },
      url: `${ranker}/entity_lookup`,
      method: 'POST',
      data: entity_name,
    };
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  /**
   * Look up possible predicates given two entities
   */
  async predicateLookup(firstNode, secondNode) {
    const config = {
      url: `${ranker}/count_predicates`,
      method: 'POST',
      data: [firstNode, secondNode],
    };
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
};

const routes = {
  entityLookup: baseRoutes.entityLookup,
  predicateLookup: baseRoutes.predicateLookup,
};

export default routes;
