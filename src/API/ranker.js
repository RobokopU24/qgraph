import axios from 'axios';
import handleAxiosError from './utils';

const ranker = 'http://robokop.renci.org:6011/api';

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} question query graph object
   */
  async entityLookup(entity_name) {
    console.log(entity_name);
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
      return handleAxiosError(error);
    }
  },
};

const routes = {
  entityLookup: baseRoutes.entityLookup,
};

export default routes;
