const axios = require('axios');
const { handleAxiosError } = require('./utils');

const base_url = 'http://robokache/api/';

const baseRoutes = {
  async getDocumentData(doc_id, token) {
    const config = {
      url: `${base_url}document/${doc_id}/data`,
      method: 'GET',
      withCredentials: true,
      headers: {},
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  async setDocumentData(doc_id, newData, token) {
    const config = {
      url: `${base_url}document/${doc_id}/data`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {},
    };
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async createDocument(doc, token) {
    const config = {
      url: `${base_url}document`,
      method: 'POST',
      data: doc,
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
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
};

const routes = {
  getQuestionData: baseRoutes.getDocumentData,

  setAnswerData: baseRoutes.setDocumentData,
  createAnswer: baseRoutes.createDocument,
};

module.exports = routes;
