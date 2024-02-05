import React, {
  useContext, useRef, useState,
} from 'react';

import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, TextField,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import GPTContext from '../../context/gpt';
import { api } from '../../API/baseUrlProxy';

const EnableForm = ({ open, handleClose }) => {
  const { setToken } = useContext(GPTContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const controllerRef = useRef(new AbortController());

  const handleCloseWithAbort = () => {
    if (controllerRef.current) { controllerRef.current.abort(); }
    handleClose();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password === '') {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    let res;
    try {
      res = await api.post('/api/gpt/auth', {
        pw: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controllerRef.current ? controllerRef.current.signal : undefined,
      });
    } catch (err) {
      setError('An error has occurred, please try again later');
      return;
    }

    if (res.status !== 200) {
      setError(res.statusText);
      setLoading(false);
      return;
    }

    const apiResponse = await res.data;

    if (apiResponse.status === 'error') {
      setError(apiResponse.message);
    } else if (apiResponse.status === 'success') {
      setPassword('');
      setLoading(false);
      setToken(apiResponse.token);
      handleCloseWithAbort();
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseWithAbort} aria-labelledby="gpt-dialog-title">
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
          <Button onClick={handleCloseWithAbort} color="default">
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="outlined"
            disabled={password === '' || loading}
          >
            { loading ? '...' : 'Enable' }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const DisableForm = ({ open, handleClose }) => {
  const { setToken } = useContext(GPTContext);

  const onSubmit = (e) => {
    e.preventDefault();
    setToken('');
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="gpt-dialog-title">
      <form onSubmit={onSubmit}>
        <DialogTitle id="gpt-dialog-title">Disable GPT Mode</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancel
          </Button>
          <Button
            type="submit"
            color="secondary"
            variant="outlined"
          >
            Disable
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function GPTForm(props) {
  const { enabled } = useContext(GPTContext);

  return enabled ? <DisableForm {...props} /> : <EnableForm {...props} />;
}
