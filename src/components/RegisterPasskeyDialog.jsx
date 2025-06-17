import React, { useContext } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';

import { usePasskey } from '~/hooks/usePasskey';
import AlertContext from '~/context/alert';

import { useAuth } from '../context/AuthContext';

function RegisterPasskeyDialog({ open, onClose }) {
  const displayAlert = useContext(AlertContext);
  const { user, setUser } = useAuth();

  const { registerPasskey } = usePasskey();

  const handleRegisterPasskey = async () => {
    try {
      await registerPasskey();
      // eslint-disable-next-line no-underscore-dangle
      setUser({ ...user, _count: { ...user._count, WebAuthnCredential: 1 } });
      displayAlert('success', 'Passkey registered successfully!');
      onClose();
    } catch (error) {
      displayAlert('error', 'Failed to register passkey. Please try again.');
    }
  };

  const skipSetup = () => {
    localStorage.setItem('passkeyPopupDenied', 'true');
    onClose();
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
          <p style={{ margin: 0 }}>Set a passkey</p>
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
        <div>
          <p>
            You can set a passkey for your account to enable passwordless login.
            This is optional but recommended for enhanced security.
          </p>
          <div style={{
            display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '20px', marginBottom: '20px',
          }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegisterPasskey}
            >
              Register Passkey
            </Button>
            <Button onClick={skipSetup}>
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterPasskeyDialog;
