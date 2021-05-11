import React from 'react';

import stringUtils from '~/utils/strings';
import queryGraphUtils from '~/utils/queryGraph';

function makeTableHeaders(message, colorMap) {
  const { query_graph, knowledge_graph } = message;
  const headerColumns = Object.entries(query_graph.nodes).map(([id, qgNode]) => {
    const backgroundColor = colorMap(qgNode.category && Array.isArray(qgNode.category) && qgNode.category[0]);
    const nodeIdLabel = queryGraphUtils.getNodeIdLabel(qgNode);
    const headerText = qgNode.name || nodeIdLabel || stringUtils.displayCategory(qgNode.category) || 'Something';
    return {
      Header: () => (
        <div style={{ backgroundColor, padding: '10px', border: '1px solid lightgrey' }}>{headerText} ({id})</div>
      ),
      id,
      accessor: (row) => row.node_bindings[id],
      Cell: ({ value }) => {
        if (value.length > 1) {
          // this is a set
          return `Set of ${stringUtils.displayCategory(qgNode.category)} [${value.length}]`;
        }
        return knowledge_graph.nodes[value[0].id].name || value[0].id;
      },
    };
  });
  return headerColumns;
}

export default {
  makeTableHeaders,
};
