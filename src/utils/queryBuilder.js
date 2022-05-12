import _ from 'lodash';

/**
 * Get the next unused Node ID in the query_graph for insertion
 */
function getNextNodeID(q_graph) {
  let index = 0;
  while (`n${index}` in q_graph.nodes) {
    index += 1;
  }
  return `n${index}`;
}

/**
 * Get the next unused Edge ID in the query_graph for insertion
 */
function getNextEdgeID(q_graph) {
  let index = 0;
  while (`e${index}` in q_graph.edges) {
    index += 1;
  }
  return `e${index}`;
}

/**
 * Get number of edges for each node
 * @param {obj} q_graph - query graph object with edges
 * @returns {obj} an object with keys as node ids and values as number of edges
 */
function getNumEdgesPerNode(q_graph) {
  return _.transform(q_graph.edges,
    (result, value) => {
      result[value.object] = result[value.object] ? result[value.object] + 1 : 1;
      result[value.subject] = result[value.subject] ? result[value.subject] + 1 : 1;
    });
}

/**
 * Get a unique list of all edges connected to specified node
 * @param {object} edges - query graph edges object
 * @param {string} nodeId - node id
 * @returns Set of edge ids
 */
function getConnectedEdges(edges, nodeId) {
  return new Set(Object.keys(edges).filter((eId) => (
    edges[eId].subject === nodeId || edges[eId].object === nodeId
  )));
}

/**
 * Parse an incoming query graph and either keep the old connected root node or
 * compute a new one
 *
 * Rules are:
 * 1. sort by unpinned and then pinned nodes
 * 2. sort by total number of edge connections
 * 3. pick first node in insertion order
 * @param {object} q_graph - valid query graph with nodes and edges
 * @returns {string} the id of the root node in the query graph
 */
function getRootNode(q_graph, rootNode) {
  if (rootNode && getConnectedEdges(q_graph.edges, rootNode).size > 0) {
    return rootNode;
  }
  // create nodes object with pinned boolean property
  const nodes = Object.entries(q_graph.nodes).map(([key, node]) => (
    {
      key,
      pinned: node.id && Array.isArray(node.id) && node.id.length > 0,
    }
  ));
  // create node map of total edge connections
  const edgeNums = getNumEdgesPerNode(q_graph);
  // split nodes into pinned and unpinned arrays
  const unpinnedNodes = nodes.filter((node) => !node.pinned && node.key in edgeNums);
  const pinnedNodes = nodes.filter((node) => node.pinned && node.key in edgeNums);
  // sort nodes by edge connections, then return the first one in the list
  // is also first one inserted
  let root = (nodes.length && nodes[0].key) || null;
  if (unpinnedNodes.length) {
    unpinnedNodes.sort((a, b) => edgeNums[b.key] - edgeNums[a.key]);
    root = unpinnedNodes[0].key;
  } else if (pinnedNodes.length) {
    pinnedNodes.sort((a, b) => edgeNums[b.key] - edgeNums[a.key]);
    root = pinnedNodes[0].key;
  }
  return root;
}

/**
 * Remove all detached sections of graph from root node
 * @param {object} q_graph - deep copy of the query_graph, modifies and returns
 * @param {string} rootNode - root node of graph
 */
function removeDetachedFromRoot(q_graph, rootNode) {
  // all edges start out as disconnected and we'll remove them when we find a connection to root
  const disconnectedEdges = Object.keys(q_graph.edges);
  // we add to connected nodes, starting default with the root node
  const connectedNodes = [rootNode];
  let foundConnections = true;
  // traverse graph and delete all edges not connected
  while (foundConnections) {
    foundConnections = false;
    // loop over all connected nodes to find edges that are connected to them
    for (let i = 0; i < connectedNodes.length; i += 1) {
      const nodeId = connectedNodes[i];
      for (let j = 0; j < disconnectedEdges.length; j += 1) {
        const edgeId = disconnectedEdges[j];
        const edge = q_graph.edges[edgeId];
        // if edge is connected to node
        if (edge.subject === nodeId || edge.object === nodeId) {
          // add nodes to connected list
          if (!(connectedNodes.indexOf(edge.subject) > -1)) {
            connectedNodes.push(edge.subject);
          }
          if (!(connectedNodes.indexOf(edge.object) > -1)) {
            connectedNodes.push(edge.object);
          }
          // remove connected edge from disconnected list
          const index = disconnectedEdges.indexOf(edgeId);
          disconnectedEdges.splice(index, 1);
          j -= 1;
          // loop again with added nodes
          foundConnections = true;
        }
      }
    }
  }
  // remove any edges still in the disconnectedEdges list
  q_graph.edges = _.omitBy(q_graph.edges, (e, id) => disconnectedEdges.indexOf(id) > -1);
  // keep all nodes that are attached to existing edges
  q_graph.nodes = _.pick(q_graph.nodes, connectedNodes);
  return q_graph;
}

/**
 * Trim any edges connected to the given node
 * @param {object} q_graph - query graph
 * @param {string} nodeId - node id
 * @returns trimDetached query graph
 */
function removeAttachedEdges(q_graph, nodeId) {
  const edgeIds = Object.keys(q_graph.edges).map((id) => id);
  edgeIds.forEach((eId) => {
    const currentEdge = q_graph.edges[eId];
    if (currentEdge.subject === nodeId || currentEdge.object === nodeId) {
      delete q_graph.edges[eId];
    }
  });
  return q_graph;
}

/**
 * Starting at root node, is this query graph valid? Is there at least one hop in the graph?
 * @param {object} query_graph - query graph object
 * @returns isValid boolean and an error message
 */
function isValidGraph(query_graph) {
  let isValid = true;
  let errMsg = '';
  const nodeIds = Object.keys(query_graph.nodes);
  if (!nodeIds.length) {
    isValid = false;
    errMsg = 'There are no terms left. Please add a new term to continue.';
  }
  for (let i = 0; i < nodeIds.length; i += 1) {
    const id = nodeIds[i];
    if (getConnectedEdges(query_graph.edges, id).size === 0) {
      isValid = false;
      errMsg = 'There is at least one disconnected term in this question.';
      break;
    }
  }
  return { isValid, errMsg };
}

export default {
  getNextNodeID,
  getNextEdgeID,
  getNumEdgesPerNode,
  getConnectedEdges,
  removeDetachedFromRoot,
  removeAttachedEdges,
  getRootNode,
  isValidGraph,
};
