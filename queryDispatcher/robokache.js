const axios = require('axios');
const handleAxiosError = require('./utils');

const protocol = 'http';
const host = process.env.ROBOKACHE_HOST || 'lvh.me';
const port = 8080;

/**
 * URL Maker
 * @param {string} ext extension to append to url
 */
const base_url = `${protocol}://${host}:${port}/api/`;

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
