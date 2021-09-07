import React, { useContext } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';

import { useAuth0 } from '@auth0/auth0-react';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import BrandContext from '~/context/brand';

import './leftDrawer.css';

/**
 * Main Drawer component on answer page
 * @param {function} onUpload - function to call when user uploads their own message
 * @param {object} displayState - state of card components
 * @param {function} updateDisplayState - dispatch function for changing which cards are shown
 * @param {object} message - full TRAPI message
 * @param {function} saveAnswer - save an answer to Robokache
 * @param {function} deleteAnswer - delete an answer from Robokache
 * @param {boolean} owned - does the user own this answer
 */
export default function LeftDrawer({
  onUpload, displayState, updateDisplayState, message,
  saveAnswer, deleteAnswer, owned,
}) {
  const { isAuthenticated } = useAuth0();
  const brandConfig = useContext(BrandContext);
  const urlHasAnswerId = useRouteMatch('/answer/:answer_id');

  function toggleDisplay(component, show) {
    updateDisplayState({ type: 'toggle', payload: { component, show } });
  }

  /**
   * Download the current message
   */
  async function download() {
    const blob = new Blob([JSON.stringify({ message }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.download = `${brandConfig.title}_message.json`;
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <Drawer
      container={document.getElementById('contentContainer')}
      variant="permanent"
      open
      classes={{
        paper: 'leftDrawer',
      }}
    >
      <Toolbar />
      <List>
        {Object.entries(displayState).map(([key, val]) => (
          <ListItem
            key={key}
            button
            onClick={() => toggleDisplay(key, !val.show)}
            disabled={val.disabled}
          >
            <ListItemIcon>
              <Checkbox
                checked={val.show}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary={val.label} />
          </ListItem>
        ))}
        <ListItem
          component="label"
          button
          disabled={!Object.keys(message).length}
          onClick={download}
        >
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Download"
              disableRipple
            >
              <GetAppIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Download Answer" />
        </ListItem>
        <ListItem
          component="label"
          button
        >
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Upload Answer"
              disableRipple
            >
              <PublishIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Upload Answer" />
          <input
            accept=".json"
            hidden
            style={{ display: 'none' }}
            type="file"
            onChange={(e) => onUpload(e)}
          />
        </ListItem>
        <ListItem
          component="label"
          button
          disabled={!Object.keys(message).length || !!urlHasAnswerId || !isAuthenticated}
          onClick={saveAnswer}
        >
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Save Answer"
              disableRipple
            >
              <CloudUploadIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Save Answer" />
        </ListItem>
        <ListItem
          component="label"
          button
          disabled={!urlHasAnswerId || !isAuthenticated || !owned}
          onClick={deleteAnswer}
        >
          <ListItemIcon>
            <IconButton
              component="span"
              style={{ fontSize: '18px' }}
              title="Delete Answer"
              disableRipple
            >
              <HighlightOffIcon />
            </IconButton>
          </ListItemIcon>
          <ListItemText primary="Delete Answer" />
        </ListItem>
      </List>
    </Drawer>
  );
}
