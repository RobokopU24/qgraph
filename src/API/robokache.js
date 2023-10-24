import utils from './utils';
import { api } from './baseUrlProxy';

// Base request method for all endpoints
async function baseRequest(path, method, body, token) {
  const config = {
    url: `/api/robokache/${path}`,
    method,
    data: body,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    return utils.handleAxiosError(error);
  }
}

const routes = {
  async getQuestions(token) {
    return baseRequest('questions', 'GET', null, token);
  },
  async getAnswers(doc_id, token) {
    return baseRequest(`answers/${doc_id}`, 'GET', null, token);
  },

  async getQuestion(doc_id, token) {
    return baseRequest(`question/${doc_id}`, 'GET', null, token);
  },
  async getAnswer(doc_id, token) {
    return baseRequest(`question/${doc_id}`, 'GET', null, token);
  },

  async getQuestionData(doc_id, token) {
    const config = {
      url: `/api/robokache/question_data/${doc_id}`,
      method: 'GET',
      withCredentials: true,
      headers: {},
      transformResponse: (res) => res,
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async getAnswerData(doc_id, token) {
    const config = {
      url: `/api/robokache/answer_data/${doc_id}`,
      method: 'GET',
      withCredentials: true,
      headers: {},
      transformResponse: (res) => res,
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },

  async setQuestionData(doc_id, newData, token) {
    const config = {
      url: `/api/robokache/question_data/${doc_id}`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {},
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },
  async setAnswerData(doc_id, newData, token) {
    const config = {
      url: `/api/robokache/answer_data/${doc_id}`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {},
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
    }
  },

  async createQuestion(doc, token) {
    return baseRequest('question', 'POST', doc, token);
  },
  async createAnswer(doc, token) {
    return baseRequest('answer', 'POST', doc, token);
  },
  async updateQuestion(doc, token) {
    return baseRequest(`question/${doc.id}`, 'PUT', doc, token);
  },
  async updateAnswer(doc, token) {
    return baseRequest(`answer/${doc.id}`, 'PUT', doc, token);
  },
  async deleteQuestion(doc_id, token) {
    return baseRequest(`question/${doc_id}`, 'DELETE', undefined, token);
  },
  async deleteAnswer(doc_id, token) {
    return baseRequest(`answer/${doc_id}`, 'DELETE', undefined, token);
  },
};

export default routes;
