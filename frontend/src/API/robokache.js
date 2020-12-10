import axios from 'axios';

import utils from './utils';

const base_url = `${window.location.origin}/api/robokache/`;

// Base request method for all endpoints
async function baseRequest(path, method, body, token) {
  const config = {
    url: base_url + path,
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
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return utils.handleAxiosError(error);
  }
}

const baseRoutes = {
  async getDocumentsNoParent(token) {
    return baseRequest('document?has_parent=false', 'GET', null, token);
  },

  async getDocument(doc_id, token) {
    return baseRequest(`document/${doc_id}`, 'GET', null, token);
  },
  async getChildrenByDocument(doc_id, token) {
    return baseRequest(`document/${doc_id}/children`, 'GET', null, token);
  },

  async getDocumentData(doc_id, token) {
    const config = {
      url: `${base_url}document/${doc_id}/data`,
      method: 'GET',
      withCredentials: true,
      headers: {},
      transformResponse: (res) => res,
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return utils.handleAxiosError(error);
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
      return utils.handleAxiosError(error);
    }
  },

  async createDocument(doc, token) {
    return baseRequest('document', 'POST', doc, token);
  },
  async updateDocument(doc, token) {
    return baseRequest(`document/${doc.id}`, 'PUT', doc, token);
  },
  async deleteDocument(doc_id, token) {
    return baseRequest(`document/${doc_id}`, 'DELETE', undefined, token);
  },
};

// Some of the API routes have the same method signatures for questions and answers.
//
// It makes sense to expose these methods separately
// so when they are called in UI code it is clear
// whether the result will be an answer or question
const routes = {
  getQuestion: baseRoutes.getDocument,
  getQuestionData: baseRoutes.getDocumentData,
  setQuestionData: baseRoutes.setDocumentData,
  createQuestion: baseRoutes.createDocument,
  updateQuestion: baseRoutes.updateDocument,
  deleteQuestion: baseRoutes.deleteDocument,

  getAnswer: baseRoutes.getDocument,
  getAnswerData: baseRoutes.getDocumentData,
  setAnswerData: baseRoutes.setDocumentData,
  createAnswer: baseRoutes.createDocument,
  updateAnswer: baseRoutes.updateDocument,
  deleteAnswer: baseRoutes.deleteDocument,

  getQuestions: baseRoutes.getDocumentsNoParent,
  getAnswersByQuestion: baseRoutes.getChildrenByDocument,
};

export default routes;
