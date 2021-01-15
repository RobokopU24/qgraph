import { useState, useEffect } from 'react';
import _ from 'lodash';

import queryGraphUtils from '@/utils/queryGraph';
import strings from '@/utils/stringUtils';

import useNode from './useNode';
import useEdge from './useEdge';

export default function useNewQuestionPanel() {
  const [name, setName] = useState('');
  const [query_graph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());

  const [showPanel, togglePanel] = useState(false);

  const [panelInfo, setPanelInfo] = useState({ type: null, id: null });
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
   * Get the next unused Node ID in the query_graph for insertion
   */
  function getNextNodeID() {
    let index = 0;
    while (`n${index}` in query_graph.nodes) {
      index += 1;
    }
    return `n${index}`;
  }

  /**
   * Get the next unused Edge ID in the query_graph for insertion
   */
  function getNextEdgeID() {
    let index = 0;
    while (`e${index}` in query_graph.edges) {
      index += 1;
    }
    return `e${index}`;
  }

  /**
   * Create a readable edge label
   * @param {string} sourceId an edge source id
   * @param {string} targetId an edge target id
   */
  function getEdgeLabel(sourceId, targetId) {
    let sourceLabel = '';
    if (sourceId) {
      sourceLabel = query_graph.nodes[sourceId].name || strings.displayType(query_graph.nodes[sourceId].type);
    }
    let targetLabel = '';
    if (targetId) {
      targetLabel = query_graph.nodes[targetId].name || strings.displayType(query_graph.nodes[targetId].type);
    }
    return `${sourceId} ${sourceLabel} → ${targetId} ${targetLabel}`;
  }

  /**
   * Initialize a node or edge
   * based on given id and type
   */
  function initializeNodeOrEdge() {
    if (panelInfo.type === 'node') {
      if (panelInfo.id) { // load node from query graph
        const nodeSeed = { ...query_graph.nodes[panelInfo.id] };
        // Convert array of types to string before seeding
        // panel
        if (Array.isArray(nodeSeed.type)) {
          [nodeSeed.type] = nodeSeed.type;
        }
        setName(panelInfo.id);
        node.initialize(nodeSeed);
      } else { // new node
        node.reset();
        setName(getNextNodeID());
      }
    } else if (panelInfo.type === 'edge') {
      if (panelInfo.id) { // load edge from query graph
        const edgeSeed = query_graph.edges[panelInfo.id];
        const label = getEdgeLabel(edgeSeed.source_id, edgeSeed.target_id);
        setName(`${panelInfo.id}: ${label}`);
        edge.initialize({ id: panelInfo.id, ...edgeSeed });
      } else { // new edge
        const newId = getNextEdgeID();
        // grab the last two nodes to prefill edge
        const [source_id, target_id] = Object.keys(query_graph.nodes).slice(-2);
        edge.initialize({
          id: newId,
          source_id,
          target_id,
        });
        const label = getEdgeLabel(source_id, target_id);
        setName(`${newId}: ${label}`);
      }
    }
  }

  useEffect(initializeNodeOrEdge, [panelInfo]);

  /**
   * Update the edge panel header
   * @param {string} source edge source id
   * @param {string} target edge target id
   * @param {string} id edge id
   */
  function updateEdgePanelHeader(source, target, id) {
    const label = getEdgeLabel(source, target, id);
    setName(`${id}: ${label}`);
  }

  /**
   * Open a node/edge panel either fresh or with a seed id
   * @param {string} type either node or edge
   * @param {string} id unique id of node or edge. i.e. n0, n1, e0...
   */
  function openPanel(type, id) {
    if (type === 'node' && query_graph.nodes[id] && query_graph.nodes[id].deleted) {
      // stop panel from opening
      return;
    }
    setPanelInfo({ type, id });

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

    // Trim a node if it is floating and marked for deletion
    const nodesToTrim = Object.keys(q_graph.nodes).filter((id) => (!notFloatingNodeIDs.has(id) && q_graph.nodes[id].deleted));

    q_graph.nodes = _.omitBy(q_graph.nodes, (n, id) => nodesToTrim.includes(id));
    // q_graph.nodes = _.pick(q_graph.nodes, notFloatingNodeIDs);
    return q_graph;
  }

  /**
   * Remove current node by active id
   */
  function removeNode() {
    const q_graph = _.cloneDeep(query_graph);
    q_graph.nodes[panelInfo.id].deleted = true;
    const trimmedQueryGraph = trimFloatingNodes(q_graph);
    updateQueryGraph(trimmedQueryGraph);
    return trimmedQueryGraph;
  }

  /**
   * Remove current edge by active id
   */
  function removeEdge() {
    const q_graph = _.cloneDeep(query_graph);
    delete q_graph.edges[panelInfo.id];
    const trimmedQueryGraph = trimFloatingNodes(q_graph);
    updateQueryGraph(trimmedQueryGraph);
    return trimmedQueryGraph;
  }

  function saveActivePanel() {
    const q_graph = _.cloneDeep(query_graph);
    if (panelInfo.type === 'node') {
      const new_node = {
        type: node.type,
      };
      // If node type isn't an array, convert to one
      if (new_node.type && !Array.isArray(new_node.type)) {
        new_node.type = [new_node.type];
      }
      if (node.curie) {
        new_node.curie = node.curie;
      }
      if (node.set) {
        new_node.set = node.set;
      }
      const node_id = panelInfo.id || getNextNodeID();
      new_node.label = `${node_id}: ${node.label || new_node.curie || strings.displayType(new_node.type)}`;

      q_graph.nodes[node_id] = new_node;
    } else {
      const new_edge = {
        source_id: edge.sourceId,
        target_id: edge.targetId,
      };
      if (edge.predicate && edge.predicate.length > 0) {
        new_edge.type = edge.predicate.map((p) => p.name);
      }

      if (!panelInfo.id) {
        q_graph.edges[getNextEdgeID()] = new_edge;
      } else {
        q_graph.edges[panelInfo.id] = new_edge;
      }
    }
    const trimmedQueryGraph = trimFloatingNodes(q_graph);
    updateQueryGraph(trimmedQueryGraph);
    togglePanel(false);
    return trimmedQueryGraph;
  }

  // Determine if current panel is valid
  let isValid;
  if (panelInfo.type === 'node') {
    isValid = node.isValid;
  } else {
    isValid = edge.isValid;
  }

  return {
    unsavedChanges,
    toggleUnsavedChanges,
    isValid,
    saveActivePanel,
    showPanel,
    panelType: panelInfo.type,
    name,
    query_graph,
    node,
    edge,
    activePanelId: panelInfo.id,
    load,
    togglePanel,
    openPanel,
    revertActivePanel,
    removeNode,
    removeEdge,
    updateEdgePanelHeader,
  };
}
