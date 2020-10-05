import React, { useState, useCallback } from 'react';

import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import { withStyles } from '@material-ui/core/styles';

import Loading from '@/components/loading/Loading';

const CenteredAlert = withStyles({
  root: { justifyContent: 'center' },
})(Alert);

export default function usePageStatus() {
  // Full page loading indicator
  const [loading, toggleLoading] = useState(true);
  // Full page error indicator
  const [error, setError] = useState('');

  function Display() {
    return (
      <Box mt={10}>
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
    toggleLoading,
    setError,
    Display: useCallback(Display, [loading, error]),
    displayPage: !loading && !error,
  };
}
