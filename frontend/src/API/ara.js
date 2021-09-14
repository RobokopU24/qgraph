import axios from 'axios';
import utils from './utils';

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} message message standard object
   */
  async getAnswer(url, message) {
    const config = {
      url,
      method: 'POST',
      data: message,
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
  getAnswer: baseRoutes.getAnswer,
};

export default routes;
