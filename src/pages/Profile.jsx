import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import { Delete as DeleteIcon, Close as CloseIcon } from '@material-ui/icons';
import { useAuth } from '~/context/AuthContext';
import API from '~/API/authRoutes';
import { authApi } from '~/API/baseUrlProxy';
import AlertContext from '~/context/alert';

function DeletePasskeyDialog({
  open, onClose, onConfirm, deviceType,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ margin: 0 }}>Delete Passkey</p>
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
        <Typography>
          Are you sure you want to delete this passkey {deviceType ? `(${deviceType})` : ''}? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Profile() {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayAlert = useContext(AlertContext);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState(null);

  const fetchPasskeys = async () => {
    try {
      const { data } = await authApi.get(API.passkeyRoutes.list);
      setPasskeys(data);
      setLoading(false);
    } catch (err) {
      displayAlert('error', 'Failed to load passkeys');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const handleDeleteClick = (passkey) => {
    setPasskeyToDelete(passkey);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await authApi.delete(`${API.passkeyRoutes.base}/${passkeyToDelete.id}`);
      setPasskeys(passkeys.filter((pk) => pk.id !== passkeyToDelete.id));
      displayAlert('success', 'Passkey deleted successfully');
    } catch (err) {
      displayAlert('error', 'Failed to delete passkey');
    }
    setDeleteDialogOpen(false);
    setPasskeyToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} style={{ padding: '2rem' }}>
      <Grid item xs={12}>
        <Paper style={{ padding: '2rem' }}>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1" gutterBottom>
            Email: {user.email}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Member since: {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper style={{ padding: '2rem' }}>
          <Typography variant="h5" gutterBottom>
            Passkeys
          </Typography>
          {passkeys.length === 0 ? (
            <Typography color="textSecondary">
              No passkeys registered
            </Typography>
          ) : (
            <List>
              {passkeys.map((passkey, index) => (
                <React.Fragment key={passkey.id}>
                  <ListItem>
                    <ListItemText
                      primary={passkey.deviceType || 'Unknown Device'}
                      secondary={`Created: ${new Date(passkey.createdAt).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteClick(passkey)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < passkeys.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Grid>

      <DeletePasskeyDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPasskeyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        deviceType={passkeyToDelete && passkeyToDelete.deviceType}
      />
    </Grid>
  );
}

export default Profile;
