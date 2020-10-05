import React, { useState, useCallback } from 'react';

import Snackbar from '@material-ui/core/Snackbar';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import { withStyles } from '@material-ui/core/styles';

import Loading from '@/components/loading/Loading';

const CenteredAlert = withStyles({
  root: { justifyContent: 'center' },
})(Alert);

export default function usePageStatus() {
  // Dismissable large alert messages at the top of the page
  const [messages, setMessages] = useState([]);

  // Full page loading indicator
  const [loading, toggleLoading] = useState(true);
  // Full page error indicator
  const [error, setError] = useState('');

  function showMessage(severity, msg) {
    setMessages([...messages, { msg, severity }]);
  }

  function clearMessage(index) {
    const newMessages = messages.slice();
    newMessages.splice(index);
    setMessages(newMessages);
  }

  function Display() {
    return (
      <Box mt={10}>
        {messages.map((m, i) => (
          <Snackbar
            open
            key={i}
            anchorOrigin={
              { vertical: 'top', horizontal: 'center' }
            }
            onClose={() => clearMessage(i)}
          >
            <Alert
              variant="filled"
              severity={m.severity}
            >
              {m.msg}
            </Alert>
          </Snackbar>
        ))}

        {error && (
          <CenteredAlert severity="error">
            {error}
          </CenteredAlert>
        )}

        {(!error && loading) && <Loading positionStatic />}
      </Box>
    );
  }

  return {
    showMessage,
    toggleLoading,
    setError,
    Display: useCallback(Display, [messages, loading, error]),
    displayPage: !loading && !error,
  };
}
