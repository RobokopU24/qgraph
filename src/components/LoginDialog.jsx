import React, { useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Input,
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { FaGoogle, FaGithub, FaFingerprint } from 'react-icons/fa';
import { useAuth } from '~/context/AuthContext';
import { usePasskey } from '~/hooks/usePasskey';
import API from '~/API/authRoutes';
import AlertContext from '~/context/alert';
import axios from 'axios';

function LoginDialog({ open, onClose }) {
  const [email, setEmail] = React.useState('');
  const displayAlert = useContext(AlertContext);
  const { login } = useAuth();
  const { loginWithPasskey, browserSupport } = usePasskey();
  const handlePasskeyLogin = async () => {
    try {
      const response = await loginWithPasskey();
      login(response.user, response.token);
      onClose();
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      displayAlert('error', 'Unable to login with passkey or no passkey registered. Please try again later. Please continue with another login method.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = API.authRoutes.google;
  };

  const handleGithubLogin = () => {
    window.location.href = API.authRoutes.github;
  };

  const handleMagicLinkLogin = () => {
    axios.post(API.authRoutes.magicLink, {
      email: email.trim(),
    }).then((response) => {
      displayAlert('success', response.data.message || 'Login link sent to your email. Please check your inbox.');
      setEmail('');
      onClose();
    }).catch((error) => {
      displayAlert('error', error.error || error.message || 'Failed to send magic link. Please try again.');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ margin: 0 }}>Login</p>
          <IconButton
            style={{ fontSize: '18px' }}
            title="Close"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem 0',
          }}
        >
          <Input
            placeholder="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleMagicLinkLogin}>Login</Button>
          <div style={{
            display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', margin: '1rem 0',
          }}
          >
            <div style={{ height: '1px', backgroundColor: '#ccc', flex: 1 }} />
            <p style={{ margin: 0, color: '#aaa', fontSize: '1rem' }}>or</p>
            <div style={{ height: '1px', backgroundColor: '#ccc', flex: 1 }} />
          </div>
          <Button
            onClick={handleGithubLogin}
            variant="outlined"
            fullWidth
            startIcon={<FaGithub />}
          >
            Login with GitHub
          </Button>
          <Button
            onClick={handleGoogleLogin}
            variant="outlined"
            fullWidth
            startIcon={<FaGoogle />}
          >
            Login with Google
          </Button>
          {browserSupport && (
            <Button
              onClick={handlePasskeyLogin}
              variant="outlined"
              fullWidth
              startIcon={<FaFingerprint />}
            >
              Login with Passkey
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
