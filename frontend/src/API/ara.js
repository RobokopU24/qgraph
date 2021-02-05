import axios from 'axios';
import utils from './utils';

// const messenger = 'http://robokop.renci.org:4866';
const strider = 'http://robokop.renci.org:5781';

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} message message standard object
   */
  async getAnswer(message) {
    const config = {
      url: `${strider}/query`,
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
