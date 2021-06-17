import axios from 'axios';

jest.mock('axios');

/**
 * Mock a generic API call with given response
 * @param {*} res - response to send back
 * @returns mocked axios response
 */
function mockResponse(res) {
  return axios.mockReturnValueOnce(res);
}

/**
 * Mock an API call to name resolver
 * @param {string} id - node id
 * @returns mocked axios response
 */
function mockNameResolver(id) {
  return axios.mockReturnValueOnce({
    data: {
      [id]: {},
    },
  });
}

/**
 * Mock an API call to node normalizer
 * @param {string} id - node id
 * @param {string|string[]} category - node category
 * @returns mocked axios response
 */
function mockNodeNorm(id, category) {
  return axios.mockReturnValueOnce({
    data: {
      [id]: {
        id: {
          label: id,
          identifier: id,
        },
        type: category,
      },
    },
  });
}

export default {
  mockResponse,
  mockNameResolver,
  mockNodeNorm,
};
