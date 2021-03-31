import {
  useState, useEffect, useContext, useMemo,
} from 'react';
import _ from 'lodash';

import AlertContext from '~/context/alert';
import queryBuilderUtils from './utils/queryBuilderUtils';

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

export default function useQueryBuilder() {
  const [query_graph, updateQueryGraph] = useState(defaultQueryGraph);
  const [rootNode, setRootNode] = useState('n0');
  const [originalNodeList, setOriginalNodeList] = useState([]);
  const displayAlert = useContext(AlertContext);

  /**
   * Create new edge and node attached to subject node
   * @param {string} nodeId node id
   * @returns {string} node id of created object node
   */
  function addHop(nodeId) {
    const newNodeId = queryBuilderUtils.getNextNodeID(query_graph);
    const newEdgeId = queryBuilderUtils.getNextEdgeID(query_graph);
    const clonedQueryGraph = _.cloneDeep(query_graph);
    clonedQueryGraph.nodes[newNodeId] = defaultNode();
    const newEdge = defaultEdge();
    let subjectId = nodeId;
    if (nodeId === undefined) {
      const nodeKeys = Object.keys(query_graph.nodes);
      subjectId = nodeKeys[nodeKeys.length - 1];
    }
    newEdge.subject = subjectId;
    newEdge.object = newNodeId;
    clonedQueryGraph.edges[newEdgeId] = newEdge;
    updateQueryGraph(clonedQueryGraph);
    return newNodeId;
  }

  /**
   * Create edge between two existing nodes
   * @param {string} subjectId node id
   * @param {string} objectId node id
   */
  function addEdge(subjectId, objectId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    const newEdgeId = queryBuilderUtils.getNextEdgeID(clonedQueryGraph);
    const newEdge = defaultEdge();
    newEdge.subject = subjectId;
    newEdge.object = objectId;
    clonedQueryGraph.edges[newEdgeId] = newEdge;
    updateQueryGraph(clonedQueryGraph);
  }

  /**
   * Delete an edge and then trim any detached nodes
   * @param {string} edgeId edge id
   */
  function deleteEdge(edgeId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    delete clonedQueryGraph.edges[edgeId];
    const keptRoot = queryBuilderUtils.computeRootNode(clonedQueryGraph, rootNode);
    const trimmedQueryGraph = queryBuilderUtils.trimDetached(clonedQueryGraph, keptRoot);
    const { isValid, newRoot } = queryBuilderUtils.isValidGraph(trimmedQueryGraph, keptRoot);
    if (isValid) {
      updateQueryGraph(trimmedQueryGraph);
      setRootNode(newRoot);
    } else {
      console.log('Not a valid query graph');
      displayAlert('error', 'You cannot delete this term. It would make this query invalid.');
    }
  }

  /**
   * Update an edge in the query graph
   * @param {string} edgeId edge key
   * @param {string} edgeType subject or object of edge
   * @param {string} nodeId node id
   * @returns boolean
   */
  function updateEdge(edgeId, edgeType, nodeId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    if (!nodeId) {
      const newNodeId = queryBuilderUtils.getNextNodeID(clonedQueryGraph);
      clonedQueryGraph.nodes[newNodeId] = defaultNode();
      clonedQueryGraph.edges[edgeId][edgeType] = newNodeId;
    } else {
      clonedQueryGraph.edges[edgeId][edgeType] = nodeId;
    }
    const keptRoot = queryBuilderUtils.computeRootNode(clonedQueryGraph, rootNode);
    const trimmedQueryGraph = queryBuilderUtils.trimDetached(clonedQueryGraph, keptRoot);
    const { isValid, newRoot } = queryBuilderUtils.isValidGraph(trimmedQueryGraph, keptRoot);
    if (isValid) {
      updateQueryGraph(trimmedQueryGraph);
      setRootNode(newRoot);
      return true;
    }
    console.log('Not a valid query graph');
    displayAlert('error', 'You cannot delete this term. It would make this query invalid.');
    return false;
  }

  /**
   * Update an edge predicate
   * @param {string} edgeId edge id in the query graph edges
   * @param {array} predicateValue an array containing selected edge predicates
   */
  function updateEdgePredicate(edgeId, predicateValue) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    clonedQueryGraph.edges[edgeId].predicate = predicateValue;
    updateQueryGraph(clonedQueryGraph);
  }

  /**
   * Update an existing node
   * @param {string} nodeId node id
   * @param {object|null} updatedNode updated node object
   */
  function updateNode(nodeId, updatedNode) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    clonedQueryGraph.nodes[nodeId] = updatedNode || defaultNode();
    updateQueryGraph(clonedQueryGraph);
  }

  /**
   * Delete an existing node and then trim the graph
   * @param {string} nodeId node id
   */
  function deleteNode(nodeId) {
    const clonedQueryGraph = _.cloneDeep(query_graph);
    delete clonedQueryGraph.nodes[nodeId];
    const trimmedQueryGraph = queryBuilderUtils.trimDetachedEdges(clonedQueryGraph, nodeId, rootNode);
    const { isValid, newRoot } = queryBuilderUtils.isValidGraph(trimmedQueryGraph, rootNode);
    if (isValid) {
      updateQueryGraph(trimmedQueryGraph);
      setRootNode(newRoot);
    } else {
      console.log('Not a valid query graph');
      displayAlert('error', 'You cannot delete this term. It would make this query invalid.');
    }
    // }
  }

  /**
   * Edge list with the first edge with the root node as its subject first
   */
  const sortedEdgeIds = useMemo(() => {
    const edgeIds = Object.keys(query_graph.edges);
    const firstEdgeIndex = edgeIds.findIndex((eId) => query_graph.edges[eId].subject === rootNode);
    const [firstEdgeId] = edgeIds.splice(firstEdgeIndex, 1);
    edgeIds.unshift(firstEdgeId);
    return edgeIds;
  }, [query_graph, rootNode]);

  /**
   * Any time the query graph changes, recompute where the original nodes are
   *
   * Sets rows as: [ { subject: boolean, object: boolean } ]
   */
  useEffect(() => {
    // rows are an array of objects
    const rows = [];
    const nodeList = new Set();
    sortedEdgeIds.forEach((edgeId) => {
      const row = {};
      const edge = query_graph.edges[edgeId];
      row.subject = !nodeList.has(edge.subject);
      row.object = !nodeList.has(edge.object);
      nodeList.add(edge.subject);
      nodeList.add(edge.object);
      rows.push(row);
    });
    setOriginalNodeList(rows);
  }, [sortedEdgeIds]);

  useEffect(() => {
    // const root = findRootNode(query_graph);
    // setRootNode(root);
  }, []);

  return {
    query_graph,
    originalNodeList,
    edgeIds: sortedEdgeIds,
    rootNode,

    updateNode,
    updateEdge,
    updateEdgePredicate,

    addEdge,
    addHop,
    deleteEdge,
    deleteNode,
  };
}
