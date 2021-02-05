import { useState, useEffect } from 'react';
import _ from 'lodash';

import queryGraphUtils from '~/utils/queryGraph';
import strings from '~/utils/stringUtils';

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
   * @param {string} subject an edge subject id
   * @param {string} object an edge object id
   */
  function getEdgeLabel(subject, object) {
    let subjectLabel = '';
    if (subject) {
      subjectLabel = query_graph.nodes[subject].label || strings.displayCategory(query_graph.nodes[subject].category);
    }
    let objectLabel = '';
    if (object) {
      objectLabel = query_graph.nodes[object].label || strings.displayCategory(query_graph.nodes[object].category);
    }
    return `${subject} ${subjectLabel} → ${object} ${objectLabel}`;
  }

  /**
   * Initialize a node or edge
   * based on given id and category
   */
  function initializeNodeOrEdge() {
    if (panelInfo.type === 'node') {
      if (panelInfo.id) { // load node from query graph
        const nodeSeed = { ...query_graph.nodes[panelInfo.id] };
        // Convert array of categories to string before seeding
        // panel
        if (Array.isArray(nodeSeed.category)) {
          [nodeSeed.category] = nodeSeed.category;
        }
        setName(`${panelInfo.id}: ${nodeSeed.name}`);
        node.initialize(nodeSeed);
      } else { // new node
        node.reset();
        setName(getNextNodeID());
      }
    } else if (panelInfo.type === 'edge') {
      if (panelInfo.id) { // load edge from query graph
        const edgeSeed = query_graph.edges[panelInfo.id];
        const label = getEdgeLabel(edgeSeed.subject, edgeSeed.object);
        setName(`${panelInfo.id}: ${label}`);
        edge.initialize({ id: panelInfo.id, ...edgeSeed });
      } else { // new edge
        const newId = getNextEdgeID();
        // grab the last two nodes to prefill edge
        const [subject, object] = Object.keys(query_graph.nodes).slice(-2);
        edge.initialize({
          id: newId,
          subject,
          object,
        });
        const label = getEdgeLabel(subject, object);
        setName(`${newId}: ${label}`);
      }
    }
  }

  useEffect(initializeNodeOrEdge, [panelInfo]);

  /**
   * Update panel header whenever node changes
   */
  useEffect(() => {
    if (panelInfo.id) {
      setName(`${panelInfo.id}: ${node.name}`);
    } else {
      setName(`${getNextNodeID()}: ${node.name}`);
    }
  }, [node.name]);

  /**
   * Update the edge panel header
   * @param {string} subject edge subject id
   * @param {string} object edge object id
   * @param {string} id edge id
   */
  function updateEdgePanelHeader(subject, object) {
    const label = getEdgeLabel(subject, object);
    if (panelInfo.id) {
      setName(`${panelInfo.id}: ${label}`);
    } else {
      setName(`${getNextEdgeID()}: ${label}`);
    }
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
      notFloatingNodeIDs.add(e.subject);
      notFloatingNodeIDs.add(e.object);
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
        category: node.category,
      };
      // If node category isn't an array, convert to one
      if (new_node.category && !Array.isArray(new_node.category)) {
        new_node.category = [new_node.category];
      }
      if (node.id && Array.isArray(node.id) && node.id.length) {
        new_node.id = node.id;
      }
      if (node.is_set) {
        new_node.is_set = node.is_set;
      }
      const nodeKey = panelInfo.id || getNextNodeID();
      new_node.name = node.name || new_node.id || strings.displayCategory(new_node.category);

      q_graph.nodes[nodeKey] = new_node;
    } else {
      const new_edge = {
        subject: edge.subject,
        object: edge.object,
      };
      if (edge.predicate && edge.predicate.length > 0) {
        new_edge.predicate = edge.predicate;
      }
      const edge_id = panelInfo.id || getNextEdgeID();

      q_graph.edges[edge_id] = new_edge;
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
