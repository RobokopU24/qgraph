import React from 'react';

import stringUtils from '~/utils/stringUtils';
import getNodeCategoryColorMap from '~/utils/colorUtils';

function makeTableHeaders(message, concepts) {
  const colorMap = getNodeCategoryColorMap(concepts);
  const { query_graph, knowledge_graph } = message;
  const headerColumns = Object.entries(query_graph.nodes).map(([id, obj]) => {
    const backgroundColor = colorMap(obj.category);
    return {
      Header: () => (
        <div style={{ backgroundColor }}>{id}: {stringUtils.displayCategory(obj.category)}</div>
      ),
      id,
      accessor: (row) => row.node_bindings[id],
      Cell: ({ value }) => {
        if (value.length > 1) {
          // this is a set
          return `Set of ${stringUtils.displayCategory(query_graph.nodes[id].category)} [${value.length}]`;
        }
        return knowledge_graph.nodes[value[0].id].name;
      },
    };
  });
  return headerColumns;
}

export default {
  makeTableHeaders,
};
