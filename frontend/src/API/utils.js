function handleAxiosError(error) {
  let errorResponse;
  if (error.response) {
    errorResponse = error.response.data;
    if (!errorResponse.message) {
      errorResponse.message = 'Unknown error. This is most likely a problem with the ARA used.';
    }
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

export default {
  handleAxiosError,
};
