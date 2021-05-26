import React from 'react';

import TextEditorRow from './textEditorRow/TextEditorRow';

/**
 * Query Builder text editor interface
 */
export default function TextEditor({ rows }) {
  return (
    <div id="queryTextEditor">
      {rows.map((row, i) => (
        <TextEditorRow
          key={row.edgeId}
          row={row}
          index={i}
        />
      ))}
    </div>
  );
}
