import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

import UploadButton from './UploadButton';
import './leftDrawer.css';

export default function LeftDrawer({ onUpload, uploadDisabled, displayState }) {
  function toggleDisplay(component, show) {
    displayState.dispatch({ type: 'toggle', payload: { component, show } });
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
        {Object.entries(displayState.state).map(([key, val]) => (
          <ListItem key={key}>
            <ListItemIcon>
              <Checkbox
                checked={val.show}
                disableRipple
                onChange={() => toggleDisplay(key, !val.show)}
              />
            </ListItemIcon>
            <ListItemText primary={val.label} />
          </ListItem>
        ))}
        <ListItem>
          <ListItemIcon>
            <UploadButton
              onUpload={onUpload}
              disabled={uploadDisabled}
            />
          </ListItemIcon>
          <ListItemText primary="Upload Answer" />
        </ListItem>
      </List>
    </Drawer>
  );
}
