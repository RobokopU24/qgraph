import React from 'react';

import TextEditorRow from './textEditorRow/TextEditorRow';

/**
 * Query Builder text editor interface
 */
export default function TextEditor({ edgeIds }) {
  return (
    <div id="queryTextEditor">
      {edgeIds.map((edgeId, i) => (
        <TextEditorRow
          key={edgeId}
          edgeId={edgeId}
          index={i}
        />
      ))}
    </div>
  );
}
