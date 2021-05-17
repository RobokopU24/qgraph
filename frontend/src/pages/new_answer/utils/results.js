import stringUtils from '~/utils/strings';
import queryGraphUtils from '~/utils/queryGraph';

/**
 * Find the directly connected nodes
 */
function findConnectedNodes(nodeId, query_graph, nodeList) {
  const connectedEdgeIds = Object.keys(query_graph.edges).filter((edgeId) => {
    const edge = query_graph.edges[edgeId];
    return edge.subject === nodeId;
  });
  connectedEdgeIds.forEach((edgeId) => {
    const { subject, object } = query_graph.edges[edgeId];
    const subjectIndex = nodeList.indexOf(subject);
    const objectIndex = nodeList.indexOf(object);
    if (subjectIndex === -1 && objectIndex === -1) {
      // add both subject and object
      nodeList.push(subject, object);
    } else if (subjectIndex > -1 && objectIndex === -1) {
      // put object right after subject
      nodeList.splice(subjectIndex + 1, 0, object);
    } else if (subjectIndex === -1 && objectIndex > -1) {
      // put subject right in front of object
      nodeList.splice(objectIndex, 0, subject);
    } else {
      // both nodes already in list, don't do anything
    }
  });
}

/**
 * Sort nodes for results table headers
 * @param {object} query_graph
 * @returns {string[]} topologically sorted nodes
 */
function sortNodes(query_graph) {
  const sortedNodes = [];
  const edgeIds = Object.keys(query_graph.edges);
  edgeIds.forEach((edgeId) => {
    const { subject } = query_graph.edges[edgeId];
    findConnectedNodes(subject, query_graph, sortedNodes);
  });
  // include any detached nodes at the end
  const extraNodes = Object.keys(query_graph.nodes).filter((nodeId) => sortedNodes.indexOf(nodeId) === -1);
  return [...sortedNodes, ...extraNodes];
}

function makeTableHeaders(message, colorMap) {
  const { query_graph, knowledge_graph } = message;
  // startingNode could be undefined for fully cyclic graph
  // topologically sort query graph nodes
  const sortedNodes = sortNodes(query_graph);
  const headerColumns = sortedNodes.map((id) => {
    const qgNode = query_graph.nodes[id];
    const backgroundColor = colorMap(qgNode.category && Array.isArray(qgNode.category) && qgNode.category[0]);
    const nodeIdLabel = queryGraphUtils.getNodeIdLabel(qgNode);
    const headerText = qgNode.name || nodeIdLabel || stringUtils.displayCategory(qgNode.category) || 'Something';
    return {
      Header: `${headerText} (${id})`,
      color: backgroundColor,
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
