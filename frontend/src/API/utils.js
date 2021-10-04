import _ from 'lodash';

function handleAxiosError(error) {
  const output = {};
  if (error.response) {
    const axiosErrorPrefix = `Error in response with code ${error.response.status}: `;
    if (error.response.data.message) {
      // Data object contains a 'message' property
      // so we assume it includes info and we don't need the prefix
      output.message = error.response.data.message;
    } else if (_.isString(error.response.data)) {
      // Not a JSON response so let's use it as a string
      output.message = `${axiosErrorPrefix} ${error.response.data}`;
    } else if (error.response.data.detail) {
      // Robokop ARA returns errors with a detail field
      output.message = `${axiosErrorPrefix} ${error.response.data.detail}`;
    } else {
      // Not sure what to do here, just say it's unparseable.
      output.message = `${axiosErrorPrefix} Unparseable error response.`;
    }
  } else {
    // This either means the server is unreachable or there was
    // some error setting up the request object
    output.message = 'Unknown axios exception encountered.';
  }

  output.status = 'error';
  return output;
}

export default {
  handleAxiosError,
};
