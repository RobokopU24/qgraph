import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { FaGoogle, FaGithub, FaFingerprint } from 'react-icons/fa';
import { useAuth } from '~/context/AuthContext';
import { usePasskey } from '~/hooks/usePasskey';
import API from '~/API/authRoutes';

function LoginDialog({ open, onClose }) {
  const { login } = useAuth();
  const { loginWithPasskey } = usePasskey();
  const handlePasskeyLogin = async () => {
    try {
      const response = await loginWithPasskey();
      login(response.user, response.token);
      onClose();
    } catch (error) {
      // TODO: Handle error
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = API.authRoutes.google;
  };

  const handleGithubLogin = () => {
    window.location.href = API.authRoutes.github;
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
          <Button
            onClick={handlePasskeyLogin}
            variant="outlined"
            fullWidth
            startIcon={<FaFingerprint />}
          >
            Login with Passkey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
