import axios from 'axios';
import utils from './utils';

const baseRoutes = {
  /**
   * Send a query graph to ask an ARA for an answer
   * @param {object} message message standard object
   */
  async getQuickAnswer(ara, message) {
    try {
      const response = await axios.post(`/api/quick_answer/?ara=${ara}`, message);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },

  async getAnswer(ara, questionId, token) {
    const config = {
      url: '/api/answer',
      method: 'POST',
      withCredentials: true,
      headers: {},
      params: {
        questionId,
        ara,
      },
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await axios(config);
      return response.data;
    } catch (e) {
      return utils.handleAxiosError(e);
    }
  },
};

const routes = {
  getQuickAnswer: baseRoutes.getQuickAnswer,
  getAnswer: baseRoutes.getAnswer,
};

export default routes;
