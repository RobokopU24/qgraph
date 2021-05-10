import React from 'react';
import Paper from '@material-ui/core/Paper';

export default function ResultExplorer({ store }) {
  return (
    <Paper
      id="resultExplorer"
      className={store.selectedRowId ? ' open' : ''}
      elevation={3}
    >
      <pre>
        {JSON.stringify(store.selectedResult, null, 4)}
      </pre>
    </Paper>
  );
}
