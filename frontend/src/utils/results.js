import stringUtils from '~/utils/strings';
import queryGraphUtils from '~/utils/queryGraph';
import queryBuilderUtils from '~/utils/queryBuilder';

/**
 * Find the first node id for topological sorting
 * @param {object} query_graph - query graph object
 *
 * *Rules:*
 * 1. Sort by pinned and then unpinned nodes
 * 2. Sort by number of connected edges
 * 3. Pick first node in insertion order
 * @returns {string} the starting node id
 */
export function findStartingNode(query_graph) {
  const nodes = Object.entries(query_graph.nodes).map(([key, node]) => (
    {
      key,
      pinned: node.ids && Array.isArray(node.ids) && node.ids.length > 0,
    }
  ));
  const edgeNums = queryBuilderUtils.getNumEdgesPerNode(query_graph);
  const unpinnedNodes = nodes.filter((node) => !node.pinned && node.key in edgeNums);
  const pinnedNodes = nodes.filter((node) => node.pinned && node.key in edgeNums);
  let startingNode = (nodes.length && nodes[0].key) || null;
  if (pinnedNodes.length) {
    pinnedNodes.sort((a, b) => edgeNums[a.key] - edgeNums[b.key]);
    startingNode = pinnedNodes[0].key;
  } else if (unpinnedNodes.length) {
    unpinnedNodes.sort((a, b) => edgeNums[a.key] - edgeNums[b.key]);
    startingNode = unpinnedNodes[0].key;
  }
  return startingNode;
}

/**
 * Find the directly connected nodes
 * @param {object} edges - edges from a query graph
 * @param {array} nodeList - list of node ids
 *
 * **Modifies the nodeList arg**
 */
function findConnectedNodes(edges, nodeList) {
  const nodeId = nodeList[nodeList.length - 1];
  const connectedEdgeIds = Object.keys(edges).filter((edgeId) => {
    const edge = edges[edgeId];
    return edge.subject === nodeId || edge.object === nodeId;
  });
  connectedEdgeIds.forEach((edgeId) => {
    const { subject, object } = edges[edgeId];
    const subjectIndex = nodeList.indexOf(subject);
    const objectIndex = nodeList.indexOf(object);
    if (objectIndex === -1) {
      nodeList.push(object);
      findConnectedNodes(edges, nodeList);
    }
    if (subjectIndex === -1) {
      nodeList.push(subject);
      findConnectedNodes(edges, nodeList);
    }
  });
}

/**
 * Sort nodes for results table headers
 * @param {object} query_graph - query graph object
 * @param {string} startingNode - node id
 * @returns {string[]} topologically sorted nodes
 */
export function sortNodes(query_graph, startingNode) {
  const sortedNodes = [startingNode];
  findConnectedNodes(query_graph.edges, sortedNodes);
  // TODO: handle detached sub-graphs, right now those nodes will be tacked on the end in insertion order
  // include any detached nodes at the end
  const extraNodes = Object.keys(query_graph.nodes).filter((nodeId) => sortedNodes.indexOf(nodeId) === -1);
  return [...sortedNodes, ...extraNodes];
}

/**
 * Make a list of table headers for the result table
 * @param {object} message - full TRAPI message
 * @param {function} colorMap - function to get color from node category
 * @returns {object[]} list of table header objects
 */
function makeTableHeaders(message, colorMap) {
  const { query_graph, knowledge_graph } = message;
  // startingNode could be undefined for fully cyclic graph
  // topologically sort query graph nodes
  const startingNode = findStartingNode(query_graph);
  if (!startingNode) {
    // If there are no query graph nodes, don't show the results table
    return [];
  }
  const sortedNodes = sortNodes(query_graph, startingNode);
  const headerColumns = sortedNodes.map((id) => {
    const qgNode = query_graph.nodes[id];
    const backgroundColor = colorMap(qgNode.categories && Array.isArray(qgNode.categories) && qgNode.categories[0]);
    const nodeIdLabel = queryGraphUtils.getTableHeaderLabel(qgNode);
    const headerText = qgNode.name || nodeIdLabel || stringUtils.displayCategory(qgNode.categories) || 'Something';
    return {
      Header: `${headerText} (${id})`,
      color: backgroundColor,
      id,
      accessor: (row) => row.node_bindings[id],
      Cell: ({ value }) => {
        if (value.length > 1) {
          // this is a set
          return `Set of ${stringUtils.displayCategory(qgNode.categories)} [${value.length}]`;
        }
        return knowledge_graph.nodes[value[0].id].name || value[0].id;
      },
      disableSortBy: true,
    };
  });
  if (results[0].score) {
    const scoreColumn = {
      Header: 'Score',
      id: 'score',
      accessor: (row) => Math.round(row.score * 1000) / 1000,
      width: 30,
      sortDescFirst: true,
    };
    headerColumns.push(scoreColumn);
  }
  return headerColumns;
}

export default {
  makeTableHeaders,
};
