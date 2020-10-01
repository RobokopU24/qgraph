function handleAxiosError(error) {
  let errorResponse;
  if (error.response) {
    errorResponse = error.response.data;
    errorResponse.status = 'error';
  } else {
    // This either means the server is unreachable or there was
    // some error setting up the request object
    errorResponse = {
      message: 'An unknown error occured',
      status: 'error',
    };
  }
  return errorResponse;
}

module.exports = handleAxiosError;
