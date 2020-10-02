import React, { useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import DescriptionIcon from '@material-ui/icons/Description';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function NewDownloadButton({ displayText, getData, fileName }) {
  const [blobURL, setBlobURL] = useState('');
  const [loading, setLoading] = useState(false);

  const hiddenButton = useRef();

  async function download() {
    setLoading(true);

    const response = await getData();
    const blob = new Blob([JSON.stringify(response)], { type: 'octet/stream' });
    setBlobURL(window.URL.createObjectURL(blob));
    hiddenButton.current.click();

    setLoading(false);
  }

  return (
    <>
      <Button
        onClick={!loading && download}
        startIcon={!loading && <DescriptionIcon />}
        variant="contained"
        size="large"
        color="secondary"
      >
        {loading ? <CircularProgress /> : displayText}
      </Button>
      <a ref={hiddenButton} href={blobURL} download={fileName()} />
    </>
  );
}
