import {
  Dialog, DialogTitle, IconButton, DialogActions, DialogContent, Button, TextField,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useState, useEffect, useContext } from 'react';
import routes from '../../../API/authRoutes';
import queryGraphUtils from '~/utils/queryGraph';
import AlertContext from '~/context/alert';

import './saveQuery.css';
import useQueryBuilder from '../useQueryBuilder';
import { authApi } from '../../../API/baseUrlProxy';

function SaveQuery({ show, close }) {
  const displayAlert = useContext(AlertContext);

  const queryBuilder = useQueryBuilder();
  const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);

  const [queryName, setQueryName] = useState('');
  const queryData = { message: { query_graph: prunedQueryGraph } };
  useEffect(() => {
    if (!show) setQueryName('');
  }, [show]);

  const handleCancel = () => {
    close();
  };

  const handleSave = () => {
    authApi.post(routes.queryRoutes.base, {
      name: queryName,
      query: queryData,
    })
      .then(() => {
        displayAlert('success', 'Query saved successfully');
        close();
      })
      .catch((error) => {
        // TODO: Handle error
        console.error('Error saving query:', error);
      });
  };

  return (
    <Dialog open={show} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0 }}>Save Query</p>
          <IconButton
            style={{
              fontSize: '18px',
            }}
            title="Close Editor"
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Query name"
          fullWidth
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={!queryName.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveQuery;
