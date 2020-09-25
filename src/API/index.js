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
  if(auth)
    config.headers.Authorization = `Bearer ${auth}`;

  let response = await fetch(base_url + path, config);
  return response.json();
}

let routes = {
  async getQuestions(token) {
    return baseRequest('document?has_parent=false', 'GET', null, token);
  },

  async getQuestion(question_id, token) {
    return baseRequest(`document/${question_id}`, 'GET', null, token);
  },
  async getAnswersByQ(question_id, token) {
    return baseRequest(`document/${question_id}/children`, 'GET', null, token);
  },

  async getQuestionData(question_id, token) {
	  let config = {
		  method: 'GET',
		  credentials: "include",
		  headers: {},
	  }
	  if(token)
		config.headers.Authorization = `Bearer ${token}`;
	  let response = await fetch(base_url + `document/${question_id}/data`, config);
	  return response.text();
  },
  async setQuestionData(question_id, newData, token) {
	  let config = {
		  method: 'PUT',
		  credentials: "include",
		  body: newData,
		  headers: {
			  Authorization: `Bearer ${token}`,
		  },
	  }
	  let response = await fetch(base_url + `document/${question_id}/data`, config);
	  return response.json();
  },

  async createQuestion(question, token) {
    return baseRequest(`document`, 'POST', question, token);
  },
  async updateQuestion(question, token) {
    return baseRequest(`document/${question.id}`, 'PUT', question, token);
  },
  async deleteQuestion(question_id, token) {
    return baseRequest(`document/${question_id}`, 'DELETE', newQuestion, token);
  },

}

// Some of the API routes have the same method signatures for questions and answers.
// 
// It makes sense to expose these methods separately 
// so when they are called in UI code it is clear
// whether the result will be an answer or question
routes = {...routes,
  getAnswer:     routes.getQuestion,
  getAnswerData: routes.getQuestionData,

  createAnswer:  routes.createQuestion,
  updateAnswer:  routes.updateQuestion,
  deleteAnswer:  routes.deleteQuestion,
}

export default routes;
