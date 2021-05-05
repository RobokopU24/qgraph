import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import stringUtils from '~/utils/strings';
import getNodeCategoryColorMap from '~/utils/colors';
import kgUtils from './kg';

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

function makeTableHeaders(message, concepts, hierarchies) {
  const colorMap = getNodeCategoryColorMap(concepts);
  const { query_graph, knowledge_graph } = message;
  const headerColumns = Object.entries(query_graph.nodes).map(([id, qgNode]) => {
    let { category } = qgNode;
    if (!category && qgNode.id) {
      category = findKgNodeCategory(knowledge_graph, qgNode.id, hierarchies);
    }
    console.log(category);
    const backgroundColor = colorMap(category && category[0]);
    return {
      Header: () => (
        <div style={{ backgroundColor }}>{id}: {stringUtils.displayCategory(qgNode.category)}</div>
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
  headerColumns.unshift({
    // Make an expander cell
    Header: () => null, // No header
    id: 'expander', // It needs an ID
    Cell: ({ row, toggleAllRowsExpanded }) => (
      <IconButton onClick={() => onExpand(row, toggleAllRowsExpanded)}>
        {row.isExpanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
      </IconButton>
    ),
    minWidth: 50,
    width: 75,
    maxWidth: 100,
    // filterable: false,
    disableFilters: true,
  });
  return headerColumns;
}

export default {
  makeTableHeaders,
};
