import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import DescriptionIcon from '@material-ui/icons/Description';
import CircularProgress from '@material-ui/core/CircularProgress';

import AlertContext from '~/context/alert';

export default function NewDownloadButton({ displayText, getData, fileName }) {
  const [loading, setLoading] = useState(false);
  const displayAlert = useContext(AlertContext);

  async function download() {
    setLoading(true);

    const response = await getData();
    if (response.status === 'error') {
      displayAlert('error', response.message);
    } else {
      const blob = new Blob([response], { type: 'application/json' });
      const a = document.createElement('a');
      a.download = fileName();
      a.href = window.URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    setLoading(false);
  }

  return (
    <Button
      onClick={download}
      startIcon={<DescriptionIcon />}
      disabled={loading}
      variant="contained"
      size="large"
      color="secondary"
    >
      {loading ? <CircularProgress /> : displayText}
    </Button>
  );
}
