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
  Avatar,
  Tabs,
  Tab,
} from '@material-ui/core';
import { Delete as DeleteIcon, Close as CloseIcon } from '@material-ui/icons';
import ReactJsonView from 'react-json-view';
import { useAuth } from '~/context/AuthContext';
import API from '~/API/authRoutes';
import { authApi } from '~/API/baseUrlProxy';
import AlertContext from '~/context/alert';
import { usePasskey } from '~/hooks/usePasskey';

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

function DeleteQueryDialog({
  open, onClose, onConfirm, queryName,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0 }}>Delete Query</p>
          <IconButton style={{ fontSize: '18px' }} title="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the query &quot;{queryName}&quot;? This action cannot be undone.
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
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queryToDelete, setQueryToDelete] = useState(null);
  const [deleteQueryDialogOpen, setDeleteQueryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { registerPasskey } = usePasskey();

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

  const fetchSavedQueries = async () => {
    try {
      const { data } = await authApi.get(API.queryRoutes.base);
      setSavedQueries(data);
    } catch (err) {
      displayAlert('error', 'Failed to load saved queries');
    }
  };

  useEffect(() => {
    fetchPasskeys();
    fetchSavedQueries();
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

  const registerNewPasskey = async () => {
    try {
      await registerPasskey();
      displayAlert('success', 'Passkey registered successfully');
      fetchPasskeys();
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      displayAlert('error', err.message || 'Failed to register passkey');
    }
  };

  const handleQueryDeleteClick = (query) => {
    setQueryToDelete(query);
    setDeleteQueryDialogOpen(true);
  };

  const handleQueryDeleteConfirm = async () => {
    try {
      await authApi.delete(`${API.queryRoutes.base}/${queryToDelete.id}`);
      setSavedQueries(savedQueries.filter((q) => q.id !== queryToDelete.id));
      displayAlert('success', 'Query deleted successfully');
    } catch (err) {
      displayAlert('error', 'Failed to delete query');
    }
    setDeleteQueryDialogOpen(false);
    setQueryToDelete(null);
  };

  const handleQuerySelect = (query) => {
    setSelectedQuery(query);
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
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              src={user.profilePicture}
              alt={user.name}
              style={{ width: 100, height: 100, marginRight: '2rem' }}
            />
            <Box>
              <Typography variant="h4" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Email: {user.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper style={{ padding: '2rem' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            style={{ marginBottom: '1rem' }}
          >
            <Tab label="Saved Queries" />
            <Tab label="Passkeys" />
          </Tabs>

          {activeTab === 0 && (
            <div style={{ display: 'flex', height: '600px' }}>
              <List style={{ flexBasis: 350, overflowY: 'auto', borderRight: '1px solid rgba(0, 0, 0, 0.12)' }}>
                {savedQueries.length === 0 ? (
                  <Typography color="textSecondary" style={{ padding: '1rem' }}>
                    No saved queries
                  </Typography>
                ) : (
                  savedQueries.map((query) => (
                    <ListItem
                      button
                      key={query.id}
                      selected={selectedQuery && selectedQuery.id === query.id}
                      onClick={() => handleQuerySelect(query)}
                    >
                      <ListItemText
                        primary={query.name}
                        secondary={new Date(query.createdAt).toLocaleDateString()}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleQueryDeleteClick(query)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                {selectedQuery ? (
                  <ReactJsonView
                    name={false}
                    theme="rjv-default"
                    collapseStringsAfterLength={15}
                    indentWidth={2}
                    iconStyle="triangle"
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    defaultValue=""
                    src={selectedQuery.query.message.query_graph}
                  />
                ) : (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontStyle: 'italic',
                    color: '#acacac',
                  }}
                  >
                    Please select a query from the list
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" gutterBottom>
                  Passkeys
                </Typography>
                <Button variant="contained" color="primary" onClick={registerNewPasskey}>
                  Add Passkey
                </Button>
              </div>
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
            </>
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

      <DeleteQueryDialog
        open={deleteQueryDialogOpen}
        onClose={() => {
          setDeleteQueryDialogOpen(false);
          setQueryToDelete(null);
        }}
        onConfirm={handleQueryDeleteConfirm}
        queryName={queryToDelete && queryToDelete.name}
      />
    </Grid>
  );
}

export default Profile;
