import React, { useState, useRef } from 'react';
import Button from '@material-ui/core/Button';

import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

export default function ClipboardButton({
  startIcon, displayText, clipboardText, notificationText,
}) {
  const [snackbarNotification, updateSnackbarNotification] = useState('');

  const shareableLinkInputRef = useRef();

  function copyToClipboard() {
    shareableLinkInputRef.current.type = 'text';
    shareableLinkInputRef.current.select();
    document.execCommand('copy');
    shareableLinkInputRef.current.type = 'hidden';
    updateSnackbarNotification(notificationText);
  }

  return (
    <>
      <Button
        startIcon={startIcon}
        variant="contained"
        size="large"
        color="secondary"
        onClick={() => copyToClipboard()}
      >
        {displayText}
      </Button>

      <input
        type="hidden"
        ref={shareableLinkInputRef}
        value={clipboardText}
      />

      <Snackbar open={!!snackbarNotification} autoHideDuration={6000} onClose={() => updateSnackbarNotification('')}>
        <Alert severity="success">
          {snackbarNotification}
        </Alert>
      </Snackbar>
    </>
  );
}
