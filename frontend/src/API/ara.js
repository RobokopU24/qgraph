import axios from 'axios';
import utils from './utils';

// const strider_url = `${window.location.origin}/api/external/strider`;
const robokop_url = `${window.location.origin}/api/external/robokop`;

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} message message standard object
   */
  async getAnswer(message) {
    const config = {
      url: `${robokop_url}/query`,
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
