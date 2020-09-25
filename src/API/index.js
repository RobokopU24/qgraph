const protocol = 'http';
const host = process.env.ROBOKACHE_HOST || 'lvh.me';
const port = 8080;

/**
 * URL Maker
 * @param {string} ext extension to append to url
 */
const base_url = `${protocol}://${host}:${port}/api/`;

// Base request method for all JSON endpoints
async function baseRequest(path, method, body, auth) {
  let config = {
    method: method,
    body: body && JSON.stringify(body),
    credentials: "include",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  };

  console.log("Request Config:");
  console.log(config);

  let response = await fetch(base_url + path, config);

  const text = await response.text();
  console.log("Response body:");
  console.log(text);

  return JSON.parse(text);
}

export default {
  async getQuestions(token) {
    return baseRequest('document?has_parent=false', 'GET', null, token);
  },
  async getAnswersByQ(question_id, token) {
    return baseRequest(`document/${question_id}/children`, 'GET', null, token);
  },
}
