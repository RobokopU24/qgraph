const protocol = 'http';
const host = process.env.ROBOKACHE_HOST || 'lvh.me';
const port = 8080;

/**
 * URL Maker
 * @param {string} ext extension to append to url
 */
const base_url = `${protocol}://${host}:${port}/api/`;

// Base request method for all endpoints
async function baseRequest(path, method, body, auth) {
  let config = {
    method: method,
    body: body && JSON.stringify(body),
    credentials: "include",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
  if (auth) {
    config.headers.Authorization = `Bearer ${auth}`;
  }

  let response = await fetch(base_url + path, config);
  return response.json();
}

let baseRoutes = {
  async getDocuments(token) {
    return baseRequest('document?has_parent=false', 'GET', null, token);
  },

  async getDocument(doc_id, token) {
    return baseRequest(`document/${doc_id}`, 'GET', null, token);
  },
  async getChildrenByDocument(doc_id, token) {
    return baseRequest(`document/${doc_id}/children`, 'GET', null, token);
  },

  async getDocumentData(doc_id, token) {
    let config = {
      method: 'GET',
      credentials: "include",
      headers: {},
    }
    if(token)
      config.headers.Authorization = `Bearer ${token}`;
    let response = await fetch(base_url + `document/${doc_id}/data`, config);
    return response.text();
  },
  async setDocumentData(doc_id, newData, token) {
    let config = {
      method: 'PUT',
      credentials: "include",
      body: newData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    let response = await fetch(base_url + `document/${doc_id}/data`, config);
    return response.json();
  },

  async createDocument(doc, token) {
    return baseRequest(`document`, 'POST', doc, token);
  },
  async updateDocument(doc, token) {
    return baseRequest(`document/${doc.id}`, 'PUT', doc, token);
  },
  async deleteDocument(doc_id, token) {
    return baseRequest(`document/${doc_id}`, 'DELETE', newDocument, token);
  },

}

// Some of the API routes have the same method signatures for questions and answers.
// 
// It makes sense to expose these methods separately 
// so when they are called in UI code it is clear
// whether the result will be an answer or question
let routes = {
  getQuestion:     baseRoutes.getDocument,
  getQuestionData: baseRoutes.getDocumentData,
  createQuestion:  baseRoutes.createDocument,
  updateQuestion:  baseRoutes.updateDocument,
  deleteQuestion:  baseRoutes.deleteDocument,

  getAnswer:     baseRoutes.getDocument,
  getAnswerData: baseRoutes.getDocumentData,
  createAnswer:  baseRoutes.createDocument,
  updateAnswer:  baseRoutes.updateDocument,
  deleteAnswer:  baseRoutes.deleteDocument,

  getAnswersByQuestion: baseRoutes.getChildrenByDocument,
}

export default routes;
