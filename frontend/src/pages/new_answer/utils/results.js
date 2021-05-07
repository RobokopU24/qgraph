import React from 'react';

import stringUtils from '~/utils/strings';
import kgUtils from './kg';
import queryGraphUtils from '~/utils/queryGraph';

const onExpand = (row, toggleAllRowsExpanded) => {
  // close all rows
  toggleAllRowsExpanded(false);
  // expand single row
  row.toggleRowExpanded(!row.isExpanded);
};

function findKgNodeCategory(knowledge_graph, id, hierarchies) {
  const kgNode = knowledge_graph.nodes[id];
  if (kgNode.category && !Array.isArray(kgNode.category)) {
    kgNode.category = [kgNode.category];
  }
  if (kgNode.category && Array.isArray(kgNode.category)) {
    kgNode.category = kgUtils.removeNamedThing(kgNode.category);
    kgNode.category = kgUtils.getRankedCategories(hierarchies, kgNode.category);
  }
  return kgNode.category;
}

function makeTableHeaders(message, colorMap) {
  const { query_graph, knowledge_graph } = message;
  const headerColumns = Object.entries(query_graph.nodes).map(([id, qgNode]) => {
    const backgroundColor = colorMap(qgNode.category && Array.isArray(qgNode.category) && qgNode.category[0]);
    const nodeIdLabel = queryGraphUtils.getNodeIdLabel(qgNode);
    const headerText = qgNode.name || nodeIdLabel || stringUtils.displayCategory(qgNode.category) || 'Something';
    return {
      Header: () => (
        <div style={{ backgroundColor }}>{headerText} ({id})</div>
      ),
      id,
      accessor: (row) => row.node_bindings[id],
      Cell: ({ value }) => {
        if (value.length > 1) {
          // this is a set
          return `Set of ${stringUtils.displayCategory(qgNode.category)} [${value.length}]`;
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
