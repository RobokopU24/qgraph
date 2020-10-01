import axios from 'axios';
import handleAxiosError from './utils';

const baseRoutes = {
  /**
   * Send a query graph to the server to ask an ARA for an answer
   * @param {string} questionId robokache question id
   * @param {object} questionData query graph object
   * @param {string} token jws token
   */
  async getAnswer(questionId, questionData, token) {
    const config = {
      url: '/api/answer',
      method: 'POST',
      params: {
        questionId,
      },
      data: questionData,
      headers: {},
    };
    config.headers.Authorization = token;
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
};

const routes = {
  getAnswer: baseRoutes.getAnswer,
};

export default routes;
