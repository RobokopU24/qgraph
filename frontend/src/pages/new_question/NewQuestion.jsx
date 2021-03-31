import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@material-ui/icons/IndeterminateCheckBoxOutlined';

import './newQuestion.css';

import API from '~/API';
import trapiUtils from '~/utils/trapiUtils';
import queryGraphUtils from '~/utils/queryGraphUtils';
import useQueryBuilder from './queryBuilder';
import NodeSelector from './nodeSelector/NodeSelector';
import PredicateSelector from './nodeSelector/PredicateSelector';
import NewD3Graph from './newD3Graph';

export default function NewQuestion() {
  const queryBuilder = useQueryBuilder();

  function newTabJSON() {
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
    // const link = document.createElement('a');
    // link.href = encodeURIComponent(JSON.stringify(queryBuilder.query_graph));
    // link.target = 'blank';
    // link.click();
    const win = window.open();
    win.document.write(`
      <iframe src="data:text/json,${encodeURIComponent(JSON.stringify(prunedQueryGraph, null, 2))}"
      frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen>
      </iframe>`);
  }

  async function onSubmit() {
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.query_graph);
    const response = await API.ara.getAnswer({ message: { query_graph: prunedQueryGraph } });
    if (response.status === 'error') {
      console.log('error', response);
      return;
    }

    const validationErrors = trapiUtils.validateMessage(response);
    if (validationErrors.length) {
      console.log('error', validationErrors.join(', '));
      return;
    }

    console.log(response.message);
  }

  return (
    <>
      <div id="queryEditorContainer">
        <div id="queryTextEditor">
          {queryBuilder.edgeIds.map((edgeId, i) => {
            const edge = queryBuilder.query_graph.edges[edgeId];
            const original = queryBuilder.originalNodeList[i] || {};
            return (
              <div
                key={edgeId}
                className="textEditorRow"
              >
                <IconButton
                  onClick={() => queryBuilder.deleteEdge(edgeId)}
                  className="textEditorIconButton"
                  disabled={queryBuilder.edgeIds.length < 2}
                >
                  <IndeterminateCheckBoxOutlinedIcon />
                </IconButton>
                <p>
                  {i === 0 && 'Find'}
                  {i === 1 && 'where'}
                  {i > 1 && 'and where'}
                </p>
                <NodeSelector
                  nodeId={edge.subject}
                  node={queryBuilder.query_graph.nodes[edge.subject]}
                  changeNode={(nodeId) => queryBuilder.updateEdge(edgeId, 'subject', nodeId)}
                  updateNode={original.subject ? queryBuilder.updateNode : () => queryBuilder.updateEdge(edgeId, 'subject', null)}
                  original={original.subject}
                  nodeOptions={{
                    includeCuries: original.subject,
                    includeCategories: original.subject,
                    includeExistingNodes: i !== 0,
                    existingNodes: Object.keys(queryBuilder.query_graph.nodes).filter(
                      (key) => key !== edge.object,
                    ).map((key) => ({ ...queryBuilder.query_graph.nodes[key], key })),
                    // clearable: i !== 0,
                  }}
                />
                <PredicateSelector
                  queryBuilder={queryBuilder}
                  edgeId={edgeId}
                />
                <NodeSelector
                  nodeId={edge.object}
                  node={queryBuilder.query_graph.nodes[edge.object]}
                  changeNode={(nodeId) => queryBuilder.updateEdge(edgeId, 'object', nodeId)}
                  updateNode={original.object ? queryBuilder.updateNode : () => queryBuilder.updateEdge(edgeId, 'object', null)}
                  original={original.object}
                  nodeOptions={{
                    includeCuries: original.object,
                    includeCategories: original.object,
                    includeExistingNodes: i !== 0,
                    existingNodes: Object.keys(queryBuilder.query_graph.nodes).filter(
                      (key) => key !== edge.subject,
                    ).map((key) => ({ ...queryBuilder.query_graph.nodes[key], key })),
                  }}
                />
                <IconButton
                  onClick={() => queryBuilder.addHop(edge.object)}
                  className="textEditorIconButton"
                >
                  <AddBoxOutlinedIcon />
                </IconButton>
              </div>
            );
          })}
        </div>
        <div id="queryGraphEditor">
          <NewD3Graph
            queryBuilder={queryBuilder}
          />
        </div>
      </div>
      {/* <Button
        onClick={onSubmit}
        variant="contained"
      >
        Submit
      </Button> */}
      <Button
        onClick={newTabJSON}
        variant="contained"
        style={{ marginLeft: '10px' }}
      >
        Create JSON
      </Button>
    </>
  );
}
