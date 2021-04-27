import React, { useContext } from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@material-ui/icons/IndeterminateCheckBoxOutlined';

import QueryBuilderContext from '~/context/queryBuilder';
import NodeSelector from './NodeSelector';
import PredicateSelector from './PredicateSelector';

import './textEditorRow.css';

export default function TextEditorRow({ row, index }) {
  const queryBuilder = useContext(QueryBuilderContext);
  const edge = queryBuilder.query_graph.edges[row.edgeId];
  const { edgeId, subjectIsReference, objectIsReference } = row;

  return (
    <div
      className="textEditorRow"
    >
      <IconButton
        onClick={() => queryBuilder.deleteEdge(edgeId)}
        className="textEditorIconButton"
        disabled={queryBuilder.textEditorRows.length < 2}
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
        setReference={(nodeId) => queryBuilder.updateEdge(edgeId, 'subject', nodeId)}
        update={subjectIsReference ? () => queryBuilder.updateEdge(edgeId, 'subject', null) : queryBuilder.updateNode}
        isReference={subjectIsReference}
        options={{
          includeCuries: !subjectIsReference,
          includeCategories: !subjectIsReference,
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
        setReference={(nodeId) => queryBuilder.updateEdge(edgeId, 'object', nodeId)}
        update={objectIsReference ? () => queryBuilder.updateEdge(edgeId, 'object', null) : queryBuilder.updateNode}
        isReference={objectIsReference}
        options={{
          includeCuries: !objectIsReference,
          includeCategories: !objectIsReference,
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
