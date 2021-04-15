import React from 'react';
import IconButton from '@material-ui/core/IconButton';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

export default function UploadButton({ onUpload, disabled }) {
  return (
    <label htmlFor="jsonEditorUpload" id="uploadIconLabel">
      <input
        accept=".json"
        style={{ display: 'none' }}
        type="file"
        id="jsonEditorUpload"
        onChange={(e) => onUpload(e)}
        disabled={disabled}
      />
      <IconButton
        component="span"
        disabled={disabled}
        style={{ fontSize: '18px' }}
        title="Load"
      >
        <CloudUploadIcon />
      </IconButton>
    </label>
  );
}
