import React from 'react';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import UploadButton from './UploadButton';

export default function LeftDrawer({ onUpload, uploadDisabled }) {
  return (
    <Drawer
      container={document.getElementById('contentContainer')}
      variant="permanent"
      open
    >
      <List>
        <ListItem>Query Graph</ListItem>
        <ListItem>Knowledge Graph</ListItem>
        <ListItem>Results Table</ListItem>
      </List>
      <UploadButton
        onUpload={onUpload}
        disabled={uploadDisabled}
      />
    </Drawer>
  );
}
