import React, { useContext } from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@material-ui/icons/IndeterminateCheckBoxOutlined';

import QueryBuilderContext from '~/context/queryBuilder';
import NodeSelector from './NodeSelector';
import PredicateSelector from './PredicateSelector';

import './textEditorRow.css';

export default function TextEditorRow({ edgeId, index }) {
  const queryBuilder = useContext(QueryBuilderContext);
  const edge = queryBuilder.query_graph.edges[edgeId];
  const original = queryBuilder.originalNodeList[index] || {};

  return (
    <div
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
        {index === 0 && 'Find'}
        {index === 1 && 'where'}
        {index > 1 && 'and where'}
      </p>
      <NodeSelector
        id={edge.subject}
        properties={queryBuilder.query_graph.nodes[edge.subject]}
        changeReference={(nodeId) => queryBuilder.updateEdge(edgeId, 'subject', nodeId)}
        update={original.subject ? queryBuilder.updateNode : () => queryBuilder.updateEdge(edgeId, 'subject', null)}
        isReference={!original.subject}
        options={{
          includeCuries: original.subject,
          includeCategories: original.subject,
          includeExistingNodes: index !== 0,
          existingNodes: Object.keys(queryBuilder.query_graph.nodes).filter(
            (key) => key !== edge.object,
          ).map((key) => ({ ...queryBuilder.query_graph.nodes[key], key })),
        }}
      />
      <PredicateSelector
        id={edgeId}
      />
      <NodeSelector
        id={edge.object}
        properties={queryBuilder.query_graph.nodes[edge.object]}
        changeReference={(nodeId) => queryBuilder.updateEdge(edgeId, 'object', nodeId)}
        update={original.object ? queryBuilder.updateNode : () => queryBuilder.updateEdge(edgeId, 'object', null)}
        isReference={!original.object}
        options={{
          includeCuries: original.object,
          includeCategories: original.object,
          includeExistingNodes: index !== 0,
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
}
