import { useState } from 'react';
import _ from 'lodash';

import useNode from './useNode';
import useEdge from './useEdge';

const initialQueryGraph = {
  nodes: [],
  edges: [],
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

  /**
   * Open a node/edpe panel either fresh or with a seed id
   * @param {string} type either node or edge
   * @param {string} id unique id of node or edge. i.e. n0, n1, e0...
   */
  function openPanel(type, id) {
    setPanelType(type);
    if (type === 'node') {
      if (id !== null && id !== undefined) { // load node from query graph
        const nodeSeed = query_graph.nodes.find((n) => n.id === id);
        setName(id);
        node.initialize(nodeSeed);
      } else { // new node
        node.reset();
        setName(`n${query_graph.nodes.length}`);
      }
    } else if (id !== null && id !== undefined) { // load edge from query graph
      const edgeSeed = query_graph.edges.find((e) => e.id === id);
      setName(id);
      edge.initialize(edgeSeed);
    } else { // new edge
      edge.reset();
      setName(`e${query_graph.edges.length}`);
    }
    // we need active id for node/edge removal
    updateActivePanelId(id);
    togglePanel(true);
  }

  /**
   * Remove deleted nodes that have no connected edges
   * @param {object} q_graph deep copy of the query_graph, modifies and returns
   */
  function trimFloatingNodes(q_graph) {
    const nodeIds = new Set();
    q_graph.edges.forEach((e) => {
      if (!e.deleted) {
        nodeIds.add(e.source_id);
        nodeIds.add(e.target_id);
      }
    });
    q_graph.nodes = q_graph.nodes.filter((n) => nodeIds.has(n.id));
    return q_graph;
  }

  /**
   * Remove current node by active id
   */
  function removeNode() {
    const q_graph = _.cloneDeep(query_graph);
    const nodeToDelete = q_graph.nodes.find((n) => n.id === activePanelId);
    nodeToDelete.deleted = true;
    const trimmedQueryGraph = trimFloatingNodes(q_graph);
    updateQueryGraph(trimmedQueryGraph);
  }

  /**
   * Remove current edge by active id
   */
  function removeEdge() {
    const q_graph = _.cloneDeep(query_graph);
    q_graph.edges.splice(activePanelId, 1);
    updateQueryGraph(q_graph);
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

      // New node
      if (!node.id) {
        new_node.id = `n${q_graph.nodes.length}`;
        q_graph.nodes.push(new_node);
      } else {
        let existing_node = q_graph.nodes.find((n) => n.id === node.id);
        // eslint-disable-next-line no-unused-vars
        existing_node = new_node;
      }
    } else {
      const new_edge = {
        source_id: edge.sourceId,
        target_id: edge.targetId,
      };
      if (node.predicate) {
        new_edge.type = node.predicate;
      }
      // New edge
      if (!edge.id) {
        new_edge.id = `e${q_graph.edges.length}`;
        q_graph.edges.push(new_edge);
      } else {
        let existing_edge = q_graph.edges.find((e) => e.id === edge.id);
        // eslint-disable-next-line no-unused-vars
        existing_edge = new_edge;
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
    removeNode,
    removeEdge,
  };
}
