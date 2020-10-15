import { useState, useEffect } from 'react';
import _ from 'lodash';

import useNode from './useNode';
import useEdge from './useEdge';

const initialQueryGraph = {
  nodes: {},
  edges: {},
};

export default function useNewQuestionPanel() {
  const [name, setName] = useState('');
  const [query_graph, updateQueryGraph] = useState(initialQueryGraph);
  const [showPanel, togglePanel] = useState(false);
  const [panelType, setPanelType] = useState(null);
  const [activePanelId, updateActivePanelId] = useState(null);
  const node = useNode();
  const edge = useEdge();

  const [unsavedChanges, toggleUnsavedChanges] = useState(false);

  /**
   * Load a copy of the query graph to be modified for new question
   * @param {object} qGraph query graph. Will make a copy and modify said copy.
   */
  function load(qGraph) {
    updateQueryGraph(_.cloneDeep(qGraph));
  }

  /*
   * Get the next unused Node ID in the query_graph for insertion
   */
  function getNextNodeID() {
    let index = 0;
    while (`n${index}` in query_graph.nodes) {
      index += 1;
    }
    return `n${index}`;
  }

  /*
   * Get the next unused Edge ID in the query_graph for insertion
   */
  function getNextEdgeID() {
    let index = 0;
    while (`n${index}` in query_graph.nodes) {
      index += 1;
    }
    return `n${index}`;
  }

  // Initialize node or edge
  // based on given id and type
  function initializeNodeOrEdge() {
    if (panelType === 'node') {
      if (activePanelId) { // load node from query graph
        const nodeSeed = query_graph.nodes[activePanelId];
        setName(activePanelId);
        node.initialize(nodeSeed);
      } else { // new node
        node.reset();
        setName(getNextNodeID());
      }
    } else if (activePanelId) { // load edge from query graph
      const edgeSeed = query_graph.edges[activePanelId];
      setName(activePanelId);
      edge.initialize(edgeSeed);
    } else { // new edge
      edge.reset();
      setName(getNextEdgeID());
    }
  }

  useEffect(initializeNodeOrEdge, [activePanelId, panelType]);

  /**
   * Open a node/edpe panel either fresh or with a seed id
   * @param {string} type either node or edge
   * @param {string} id unique id of node or edge. i.e. n0, n1, e0...
   */
  function openPanel(type, id) {
    setPanelType(type);
    updateActivePanelId(id);

    togglePanel(true);
    toggleUnsavedChanges(false);
  }

  function revertActivePanel() {
    node.reset();
    edge.reset();
    initializeNodeOrEdge();
    toggleUnsavedChanges(false);
  }

  /**
   * Remove deleted nodes that have no connected edges
   * @param {object} q_graph deep copy of the query_graph, modifies and returns
   */
  function trimFloatingNodes(q_graph) {
    const notFloatingNodeIDs = new Set();
    Object.values(q_graph.edges).forEach((e) => {
      notFloatingNodeIDs.add(e.source_id);
      notFloatingNodeIDs.add(e.target_id);
    });
    const floatingNodeIDs = Object.keys(q_graph.nodes).filter((id) => !(notFloatingNodeIDs.has(id)));

    // Trim a node if it is floating and marked for deletion
    const nodesToTrim = Object.entries(q_graph.nodes)
      .filter(([id, n]) => floatingNodeIDs.includes(id) && n.deleted)
      .map(([id, n]) => id);

    q_graph.nodes = _.omit(q_graph.nodes, nodesToTrim);
    // q_graph.nodes = _.pick(q_graph.nodes, notFloatingNodeIDs);
    return q_graph;
  }

  /**
   * Remove current node by active id
   */
  function removeNode() {
    const q_graph = _.cloneDeep(query_graph);
    const nodeToDelete = q_graph.nodes[activePanelId];
    nodeToDelete.deleted = true;
    const trimmedQueryGraph = trimFloatingNodes(q_graph);
    updateQueryGraph(trimmedQueryGraph);
  }

  /**
   * Remove current edge by active id
   */
  function removeEdge() {
    const q_graph = _.cloneDeep(query_graph);
    delete q_graph.edges[activePanelId];
    const trimmedQueryGraph = trimFloatingNodes(q_graph);
    updateQueryGraph(trimmedQueryGraph);
  }

  function saveActivePanel() {
    const q_graph = _.cloneDeep(query_graph);
    if (panelType === 'node') {
      const new_node = {
        type: node.type,
      };
      if (node.curie) {
        new_node.curie = node.curie;
      }
      if (node.name) {
        new_node.name = node.name;
      }

      if (!activePanelId) {
        q_graph.nodes[getNextNodeID()] = new_node;
      } else {
        q_graph.nodes[activePanelId] = new_node;
      }
    } else {
      const new_edge = {
        source_id: edge.sourceId,
        target_id: edge.targetId,
      };
      if (node.predicate) {
        new_edge.type = node.predicate;
      }

      if (!activePanelId) {
        q_graph.edges[getNextEdgeID()] = new_edge;
      } else {
        q_graph.edges[activePanelId] = new_edge;
      }
    }
    updateQueryGraph(q_graph);
    togglePanel(false);
    return q_graph;
  }

  return {
    unsavedChanges,
    toggleUnsavedChanges,
    saveActivePanel,
    showPanel,
    panelType,
    name,
    query_graph,
    node,
    edge,
    activePanelId,
    load,
    togglePanel,
    setPanelType,
    openPanel,
    revertActivePanel,
    removeNode,
    removeEdge,
  };
}
