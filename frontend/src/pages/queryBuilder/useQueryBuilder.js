import {
  useEffect, useContext, useReducer, useMemo,
} from 'react';

import AlertContext from '~/context/alert';
import queryBuilderUtils from '~/utils/queryBuilder';
import queryGraphUtils from '~/utils/queryGraph';

function getDefaultNode() {
  return {
    category: [],
    id: [],
  };
}
function getDefaultEdge(subject, object) {
  return {
    subject: subject || '',
    object: object || '',
    predicate: ['biolink:related_to'],
  };
}

const defaultQueryGraph = {
  nodes: {
    n0: getDefaultNode(),
    n1: getDefaultNode(),
  },
  edges: {
    e0: getDefaultEdge('n0', 'n1'),
  },
};

const initialState = {
  query_graph: defaultQueryGraph,
  rootNode: 'n0',
  isValid: true,
  errMessage: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'addEdge': {
      const [subjectId, objectId] = action.payload;
      const newEdgeId = queryBuilderUtils.getNextEdgeID(state.query_graph);
      state.query_graph.edges[newEdgeId] = getDefaultEdge(subjectId, objectId);
      break;
    }
    case 'editEdge': {
      const { edgeId, endpoint, nodeId } = action.payload;
      if (!nodeId) {
        const newNodeId = queryBuilderUtils.getNextNodeID(state.query_graph);
        state.query_graph.nodes[newNodeId] = getDefaultNode();
        state.query_graph.edges[edgeId][endpoint] = newNodeId;
      } else {
        state.query_graph.edges[edgeId][endpoint] = nodeId;
      }
      state.rootNode = queryBuilderUtils.computeRootNode(state.query_graph, state.rootNode);
      state.query_graph = queryBuilderUtils.removeDetachedFromRoot(state.query_graph, state.rootNode);
      break;
    }
    case 'editPredicate': {
      const { id, predicate } = action.payload;
      state.query_graph.edges[id].predicate = predicate;
      break;
    }
    case 'deleteEdge': {
      const { id } = action.payload;
      delete state.query_graph.edges[id];
      state.rootNode = queryBuilderUtils.computeRootNode(state.query_graph, state.rootNode);
      state.query_graph = queryBuilderUtils.removeDetachedFromRoot(state.query_graph, state.rootNode);
      break;
    }
    case 'addHop': {
      const { nodeId } = action.payload;
      const newNodeId = queryBuilderUtils.getNextNodeID(state.query_graph);
      const newEdgeId = queryBuilderUtils.getNextEdgeID(state.query_graph);
      let subjectId = nodeId;
      if (nodeId === undefined) {
        const nodeKeys = Object.keys(state.query_graph.nodes);
        subjectId = nodeKeys[nodeKeys.length - 1];
      }
      state.query_graph.edges[newEdgeId] = getDefaultEdge(subjectId, newNodeId);
      state.query_graph.nodes[newNodeId] = getDefaultNode();
      break;
    }
    case 'addNode': {
      const newNodeId = queryBuilderUtils.getNextNodeID(state.query_graph);
      state.query_graph.nodes[newNodeId] = getDefaultNode();
      break;
    }
    case 'editNode': {
      const { id, node } = action.payload;
      state.query_graph.nodes[id] = node || getDefaultNode();
      break;
    }
    case 'deleteNode': {
      const { id } = action.payload;
      delete state.query_graph.nodes[id];
      const trimmedQueryGraph = queryBuilderUtils.removeAttachedEdges(state.query_graph, id);
      if (
        id === state.rootNode || // root node is deleted
        queryBuilderUtils.getConnectedEdges(trimmedQueryGraph.edges, state.rootNode).size === 0 // root node is detached
      ) {
        state.rootNode = queryBuilderUtils.findRootNode(trimmedQueryGraph);
      }
      state.query_graph = queryBuilderUtils.removeDetachedFromRoot(trimmedQueryGraph, state.rootNode);
      break;
    }
    case 'saveGraph': {
      state.query_graph = queryGraphUtils.standardize(action.payload);
      break;
    }
    default: {
      return state;
    }
  }
  const { isValid, errMsg } = queryBuilderUtils.isValidGraph(state.query_graph);
  state.isValid = isValid;
  state.errMessage = errMsg;
  return { ...state };
}

/**
 * Query builder main store
 *
 * **The main source for the query graph**
 * - Handles all adding, deleting, modifying of nodes and edges
 */
export default function useQueryBuilder() {
  const displayAlert = useContext(AlertContext);

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.isValid && state.errMessage) {
      displayAlert('error', state.errMessage);
    }
  }, [state.isValid, state.errMessage]);

  /**
   * Any time the query graph changes, recompute the text editor rows
   *
   * Sets rows as: [ { subject: boolean, object: boolean } ]
   */
  const textEditorRows = useMemo(() => {
    if (!state.isValid) {
      return [];
    }
    // rows are an array of objects
    const rows = [];
    const { query_graph, rootNode } = state;
    const nodeList = new Set();
    const edgeIds = Object.keys(query_graph.edges);
    const firstEdgeIndex = edgeIds.findIndex((eId) => query_graph.edges[eId].subject === rootNode);
    if (firstEdgeIndex !== -1) {
      const [firstEdgeId] = edgeIds.splice(firstEdgeIndex, 1);
      edgeIds.unshift(firstEdgeId);
    }
    edgeIds.forEach((edgeId) => {
      const row = {};
      const edge = query_graph.edges[edgeId];
      row.edgeId = edgeId;
      row.subjectIsReference = nodeList.has(edge.subject);
      nodeList.add(edge.subject);
      row.objectIsReference = nodeList.has(edge.object);
      nodeList.add(edge.object);
      rows.push(row);
    });
    return rows;
  }, [state]);

  return {
    state,
    textEditorRows,
    dispatch,
  };
}
