import axios from 'axios';

const protocol = 'http';
const host = process.env.ROBOKACHE_HOST || 'lvh.me';
const port = 8080;

/**
 * URL Maker
 * @param {string} ext extension to append to url
 */
const base_url = `${protocol}://${host}:${port}/api/`;

function handleAxiosError(error) {
  let errorResponse;
  if (error.response) {
    errorResponse = error.response.data;
    errorResponse.status = 'error';
  } else {
    // This either means the server is unreachable or there was
    // some error setting up the request object
    errorResponse = {
      message: 'We were unable to reach the backend server to process your request. Please try again later.',
      status: 'error',
    };
  }
  return errorResponse;
}

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
    return handleAxiosError(error);
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
  async setDocumentData(doc_id, newData, token, onUploadPercentage) {
    function onUploadProgress(progressEvent) {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );

      if (onUploadPercentage) {
        onUploadPercentage(percentCompleted);
      }
    }
    const config = {
      url: `${base_url}document/${doc_id}/data`,
      method: 'PUT',
      data: newData,
      withCredentials: true,
      headers: {},
      onUploadProgress,
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
