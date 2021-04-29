import React, { useState } from 'react';

import Button from '@material-ui/core/Button';

import './queryBuilder.css';

// import API from '~/API';
// import trapiUtils from '~/utils/trapi';
import QueryBuilderContext from '~/context/queryBuilder';
import queryGraphUtils from '~/utils/queryGraph';
import useQueryBuilder from './useQueryBuilder';
import GraphEditor from './GraphEditor';
import TextEditor from './TextEditor';
import JsonEditor from './JsonEditor';

/**
 * Query Builder parent component
 *
 * Displays the text, graph, and json editors
 */
export default function QueryBuilder() {
  const queryBuilder = useQueryBuilder();
  const [showJson, toggleJson] = useState(false);

  /**
   * Open iframe in new tab and display query graph json
   */
  function newTabJSON() {
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.state.query_graph);
    const win = window.open();
    win.document.write(`
      <iframe src="data:text/json,${encodeURIComponent(JSON.stringify(prunedQueryGraph, null, 2))}"
      frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen>
      </iframe>`);
  }

  /**
   * Submit this query to an ARA and then navigate to the answer page
   */
  // async function onSubmit() {
  //   const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
  //   const response = await API.ara.getAnswer({ message: { query_graph: prunedQueryGraph } });
  //   if (response.status === 'error') {
  //     console.log('error', response);
  //     return;
  //   }

  //   const validationErrors = trapiUtils.validateMessage(response);
  //   if (validationErrors.length) {
  //     console.log('error', validationErrors.join(', '));
  //     return;
  //   }

  //   console.log(response.message);
  // }

  return (
    <>
      <div id="queryEditorContainer">
        <QueryBuilderContext.Provider value={queryBuilder}>
          <TextEditor
            rows={queryBuilder.textEditorRows}
          />
          <GraphEditor />
          <JsonEditor
            show={showJson}
            close={() => toggleJson(false)}
          />
        </QueryBuilderContext.Provider>
      </div>
      <Button
        onClick={() => toggleJson(true)}
        variant="contained"
      >
        Edit JSON
      </Button>
      {/* <Button
        onClick={onSubmit}
        variant="contained"
        style={{ marginLeft: '10px' }}
      >
        Submit
      </Button> */}
      <Button
        onClick={newTabJSON}
        variant="contained"
        style={{ marginLeft: '10px' }}
      >
        View JSON
      </Button>
    </>
  );
}
