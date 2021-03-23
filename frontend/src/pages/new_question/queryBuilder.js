import { useState, useEffect } from 'react';
import _ from 'lodash';

function defaultNode() {
  return {
    category: [],
    id: [],
  };
}
function defaultEdge() {
  return {
    subject: '',
    object: '',
    predicate: ['biolink:related_to'],
  };
}

const defaultQueryGraph = {
  nodes: {
    n0: defaultNode(),
    n1: defaultNode(),
  },
  edges: {
    e0: {
      subject: 'n0',
      object: 'n1',
      predicate: ['biolink:related_to'],
    },
  },
};

/**
 * Parse an incoming query graph and find the "root" node
 * @param {object} q_graph valid query graph with nodes and edges
 * @returns {string} the key of the root node in the query graph
 */
function findRootNode(q_graph) {
  // create nodes object with pinned boolean property
  const nodes = Object.entries(q_graph.nodes).map(([key, node]) => (
    {
      key,
      pinned: node.id && Array.isArray(node.id) && node.id.length > 0,
    }
  ));
  // split nodes into pinned and unpinned arrays
  const unpinnedNodes = nodes.filter((node) => !node.pinned);
  const pinnedNodes = nodes.filter((node) => node.pinned);
  // create node map of total edge connections
  const edgeNums = _.transform(q_graph.edges,
    (result, value) => {
      result[value.object] = result[value.object] ? result[value.object] + 1 : 1;
      result[value.subject] = result[value.subject] ? result[value.subject] + 1 : 1;
    });
  // sort nodes by edge connections, then return the first one in the list
  // is also first one inserted
  let root = null;
  if (unpinnedNodes.length) {
    unpinnedNodes.sort((a, b) => edgeNums[a.key] - edgeNums[b.key]);
    root = unpinnedNodes[0].key;
  } else {
    pinnedNodes.sort((a, b) => edgeNums[a.key] - edgeNums[b.key]);
    root = pinnedNodes[0].key;
  }
  // console.log(root);
  return root;
}

export default function useQueryBuilder() {
  const [query_graph, updateQueryGraph] = useState(defaultQueryGraph);
  const [rootNode, setRootNode] = useState('n0');

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
   * Remove all detached sections of graph from root node
   *
   * Rules are:
   * 1. sort by unpinned and then pinned nodes
   * 2. sort by total number of edge connections
   * 3. pick first node in insertion order
   * @param {object} q_graph deep copy of the query_graph, modifies and returns
   */
  function trimDetached(q_graph) {
    // all edges start out as disconnected and we'll remove them when we find a connection to root
    const disconnectedEdges = new Set(Object.keys(q_graph.edges));
    // we add to connected nodes, starting default with the root node
    const connectedNodes = new Set([rootNode]);
    let foundConnections = true;
    // traverse graph and delete all edges not connected
    while (foundConnections) {
      let foundConnection = false;
      // loop over all connected nodes to find edges that are connected to them
      [...connectedNodes].forEach((nodeId) => {
        [...disconnectedEdges].forEach((e) => {
          const edge = q_graph.edges[e];
          // if edge is connected to node
          if (edge.subject === nodeId || edge.object === nodeId) {
            connectedNodes.add(edge.subject);
            connectedNodes.add(edge.object);
            disconnectedEdges.delete(e);
            foundConnection = true;
          }
        });
      });
      // no more connected edges, break out
      if (!foundConnection) {
        foundConnections = false;
      }
    }
    q_graph.edges = _.omitBy(q_graph.edges, (e, id) => disconnectedEdges.has(id));
    // delete all floating nodes
    const notFloatingNodeIDs = new Set();
    Object.values(q_graph.edges).forEach((e) => {
      notFloatingNodeIDs.add(e.subject);
      notFloatingNodeIDs.add(e.object);
    });

    // Trim a node if it is floating and marked for deletion
    const nodesToTrim = Object.keys(q_graph.nodes).filter((id) => (!notFloatingNodeIDs.has(id)));

    q_graph.nodes = _.omitBy(q_graph.nodes, (n, id) => nodesToTrim.includes(id));
    // q_graph.nodes = _.pick(q_graph.nodes, notFloatingNodeIDs);
    return q_graph;
  }

  /**
   * After deleting a node, trim any edges connected to it
   * @param {object} q_graph query graph
   * @returns trimDetached query graph
   */
  function trimDetachedEdges(q_graph) {
    const edgeIds = Object.keys(q_graph.edges).map((id) => id);
    edgeIds.forEach((eId) => {
      const currentEdge = q_graph.edges[eId];
      if (
        (currentEdge.subject !== rootNode && currentEdge.object !== rootNode) &&
        (!q_graph.nodes[currentEdge.subject] || !q_graph.nodes[currentEdge.object])
      ) {
        delete q_graph.edges[eId];
      }
    });
    return trimDetached(q_graph);
  }

  /**
   * Create new edge and node attached to subject node
   * @param {string} subjectId node id
   * @returns {string} node id of created object node
   */
  function addHop(subjectId) {
    const newNodeId = getNextNodeID(query_graph);
    const newEdgeId = getNextEdgeID(query_graph);
    const clonedQueryGraph = _.cloneDeep(query_graph);
    clonedQueryGraph.nodes[newNodeId] = defaultNode();
    const newEdge = defaultEdge();
    newEdge.subject = subjectId;
    newEdge.object = newNodeId;
    clonedQueryGraph.edges[newEdgeId] = newEdge;
    updateQueryGraph(clonedQueryGraph);
    return newNodeId;
  }

  function removeHop(edgeId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    delete clonedQueryGraph.edges[edgeId];
    const trimmedQueryGraph = trimDetached(clonedQueryGraph);
    updateQueryGraph(trimmedQueryGraph);
  }

  function updateNode(nodeId, updatedNode) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    clonedQueryGraph.nodes[nodeId] = updatedNode || defaultNode();
    const trimmedQueryGraph = trimDetached(clonedQueryGraph);
    updateQueryGraph(trimmedQueryGraph);
  }

  /**
   * Update an edge in the query graph
   * @param {string} edgeId edge key
   * @param {string} edgeType subject or object of edge
   * @param {string} nodeId node id
   */
  function updateEdge(edgeId, edgeType, nodeId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    if (!nodeId) {
      const newNodeId = getNextNodeID(clonedQueryGraph);
      clonedQueryGraph.edges[edgeId][edgeType] = newNodeId;
      updateNode(newNodeId, null);
    } else {
      clonedQueryGraph.edges[edgeId][edgeType] = nodeId;
    }
    const trimmedQueryGraph = trimDetached(clonedQueryGraph);
    updateQueryGraph(trimmedQueryGraph);
  }

  /**
   * Update an edge predicate
   * @param {string} edgeId edge id in the query graph edges
   * @param {array} predicateValue an array containing selected edge predicates
   */
  function updateEdgePredicate(edgeId, predicateValue) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    const edge = clonedQueryGraph.edges[edgeId];
    if (predicateValue.length) {
      edge.predicate = predicateValue;
    } else {
      delete edge.predicate;
    }
    updateQueryGraph(clonedQueryGraph);
  }

  function addEdge(subjectId, objectId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    const newEdgeId = getNextEdgeID(clonedQueryGraph);
    const newEdge = defaultEdge();
    newEdge.subject = subjectId;
    newEdge.object = objectId;
    clonedQueryGraph.edges[newEdgeId] = newEdge;
    updateQueryGraph(clonedQueryGraph);
  }

  function deleteNode(nodeId) {
    if (nodeId !== rootNode) {
      const clonedQueryGraph = _.cloneDeep(query_graph);
      delete clonedQueryGraph.nodes[nodeId];
      const trimmedQueryGraph = trimDetachedEdges(clonedQueryGraph);
      updateQueryGraph(trimmedQueryGraph);
    }
  }

  // useEffect(() => {
  //   console.log('query graph', query_graph);
  // }, [query_graph]);

  // useEffect(() => {
  //   const root = findRootNode(query_graph);
  //   setRootNode(root);
  // }, []);

  return {
    query_graph,
    edgeIds: Object.keys(query_graph.edges),

    updateNode,
    updateEdge,
    updateEdgePredicate,

    addEdge,
    addHop,
    removeHop,
    deleteNode,
  };
}
