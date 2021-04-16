import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@material-ui/icons/IndeterminateCheckBoxOutlined';

import NodeSelector from './nodeSelector/NodeSelector';
import PredicateSelector from './nodeSelector/PredicateSelector';

/**
 * Query Builder text editor interface
 * @param {obj} queryBuilder query builder custom hook
 */
export default function TextEditor({ queryBuilder }) {
  return (
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
  );
}
