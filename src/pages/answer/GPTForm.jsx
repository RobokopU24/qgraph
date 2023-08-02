import React, { useContext, useState } from 'react';

import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, TextField,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import GPTContext from '../../context/gpt';

export default function GPTForm({
  open,
  handleClose,
}) {
  const { setEnabled } = useContext(GPTContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    console.log(password);
    setEnabled((prev) => !prev);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="gpt-dialog-title">
      <form onSubmit={onSubmit}>
        <DialogTitle id="gpt-dialog-title">Enable GPT Mode</DialogTitle>
        <DialogContent>

          <DialogContentText>
            Enter your password to use ChatGPT for context-aware summaries of the result graph:
          </DialogContentText>

          <TextField
            autoFocus
            label="Password"
            id="gpt-password"
            type="password"
            variant="outlined"
            style={{ marginTop: '3rem', marginBottom: '3rem' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            error={error !== ''}
            helperText={error !== '' ? error : undefined}
          />

          <Alert
            severity="warning"
            icon={false}
            style={{
              marginLeft: '-24px',
              marginRight: '-24px',
              marginTop: '2rem',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            GPT mode is currently invite-only. Please <Link href="https://robokop.renci.org/#contact" target="_blank" rel="noopener noreferrer">contact us</Link> for inquiries.
          </Alert>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="outlined" disabled={password === ''}>
            Enable
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
