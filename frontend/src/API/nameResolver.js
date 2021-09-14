import axios from 'axios';
import utils from './utils';
import { name_resolver } from './services';

const baseRoutes = {
  /**
   * Look up possible entities using a search string
   */
  async entityLookup(search_string, limit, cancel) {
    const config = {
      headers: {
        'Content-Type': 'text/plain',
      },
      url: `${name_resolver}/lookup`,
      method: 'POST',
      params: {
        string: search_string,
        limit,
      },
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
  entityLookup: baseRoutes.entityLookup,
};

export default routes;
