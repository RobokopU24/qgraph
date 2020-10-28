import axios from 'axios';
import handleAxiosError from './utils';

const baseUrl = 'http://robokop.renci.org:2433';

const baseRoutes = {
  /**
   * Look up possible entities using a search string
   */
  async entityLookup(search_string, limit, offset) {
    const config = {
      headers: {
        'Content-Type': 'text/plain',
      },
      url: `${baseUrl}/lookup`,
      method: 'POST',
      params: {
        string: search_string,
        limit,
        offset,
      }
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
