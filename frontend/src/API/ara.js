import axios from 'axios';
import utils from './utils';

const messenger = 'http://robokop.renci.org:4868';

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} question query graph object
   */
  async getAnswer(question) {
    const config = {
      url: `${messenger}/answer`,
      method: 'POST',
      data: {
        message: {
          query_graph: question,
        },
      },
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
