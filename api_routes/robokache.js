const axios = require('axios');
const router = require('express').Router();

const utils = require('./utils');
const { robokache } = require('./services');

// Base request method for all endpoints
async function baseRequest(path, method, body, token) {
  const config = {
    url: `${robokache}/api/${path}`,
    method,
    data: body,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (token) {
    config.headers.Authorization = token;
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
      url: `${robokache}/api/document/${doc_id}/data`,
      method: 'GET',
      withCredentials: true,
      headers: {},
      transformResponse: (res) => res,
    };
    if (token) {
      config.headers.Authorization = token;
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
      url: `${robokache}/api/document/${doc_id}/data`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {},
    };
    config.headers.Authorization = token;
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

router.route('/question/:doc_id')
  .get(async (req, res) => {
    res.send(await routes.getQuestion(req.params.doc_id, req.headers.authorization));
  })
  .post(async (req, res) => {
    res.send(await routes.createQuestion(req.body, req.headers.authorization));
  })
  .put(async (req, res) => {
    res.send(await routes.updateQuestion(req.body, req.headers.authorization));
  })
  .delete(async (req, res) => {
    res.send(await routes.deleteQuestion(req.params.doc_id, req.headers.authorization));
  });

router.route('/question_data/:doc_id')
  .get(async (req, res) => {
    res.send(await routes.getQuestionData(req.params.doc_id, req.headers.authorization));
  })
  .put(async (req, res) => {
    res.send(await routes.setQuestionData(req.body, req.headers.authorization));
  });

router.route('/questions')
  .get(async (req, res) => {
    res.send(await routes.getQuestions(req.headers.authorization));
  });

router.route('/answer')
  .post(async (req, res) => {
    res.send(await routes.createAnswer(req.body, req.headers.authorization));
  });

router.route('/answer/:doc_id')
  .get(async (req, res) => {
    res.send(await routes.getAnswer(req.params.doc_id, req.headers.authorization));
  })
  .put(async (req, res) => {
    res.send(await routes.updateAnswer(req.body, req.headers.authorization));
  })
  .delete(async (req, res) => {
    res.send(await routes.deleteAnswer(req.params.doc_id, req.headers.authorization));
  });

router.route('/answer_data/:doc_id')
  .get(async (req, res) => {
    res.send(await routes.getAnswerData(req.params.doc_id, req.headers.authorization));
  })
  .put(async (req, res) => {
    res.send(await routes.setAnswerData(req.params.doc_id, req.body, req.headers.authorization));
  });

router.route('/answers/:doc_id')
  .get(async (req, res) => {
    res.send(await routes.getAnswersByQuestion(req.params.doc_id, req.headers.authorization));
  });

module.exports = {
  routes,
  router,
};
