import { useState } from 'react';
import _ from 'lodash';
import queryGraphUtils from '@/utils/queryGraph';

function getEmptyQueryGraph() {
  return {
    nodes: [], // { id, name?, type, curie? }
    edges: [], // { id, source_id, target_id, predicate? }
  };
}

export default function useQuestionStore() {
  // const [concepts, setConcepts] = useState([]);
  const [question_name, updateQuestionName] = useState('');
  const [query_graph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());
  const [notes, updateNotes] = useState('');
  // const [graphState, updateGraphState] = useState(graphStates.empty);
  // const [graphState, updateGraphState] = useState('empty');
  // const [panelState, updatePanelState] = useState([]);
  // const [activePanelInd, setActivePanelInd] = useState(null);
  // const [activePanelState, updateActivePanelState] = useState({});
  // const [predicateList, setPredicateList] = useState({});
  // const [nodePropertyList, setNodePropertyList] = useState({});
  // const [showPanelModal, togglePanelModal] = useState(false);

  function resetQuestion() {
    updateQuestionName('');
    updateQueryGraph(queryGraphUtils.getEmptyQueryGraph());
    updateNotes('');
    // updateGraphState('empty');
    // updatePanelState([]);
    // setActivePanelInd(null);
    // updateActivePanelState({});
  }

  /**
   * Returns a full question
   */
  function makeQuestion() {
    const newQueryGraph = getEmptyQueryGraph();
    const nodeIdMap = new Map(); // Mapping between internal integer ids to string ids for external consumption
    panelState.forEach((panel) => {
      if (isNode(panel)) {
        nodeIdMap.set(panel.id, `n${panel.id}`); // Convert integer id back to string for export
      }
    });
    panelState.forEach((panel) => {
      if (isNode(panel)) {
        const { deleted, curieEnabled, ...panelJson } = panel.toJsonObj();
        panelJson.id = nodeIdMap.get(panelJson.id);
        newQueryGraph.nodes.push(panelJson);
      }
      if (isEdge(panel)) {
        const { predicate, ...panelJson } = panel.toJsonObj();
        const typeObj = predicate ? { type: predicate } : {}; // Remap internal `predicate` field to `type` field
        panelJson.id = `e${panelJson.id}`; // Convert integer id back to string for export
        panelJson.source_id = nodeIdMap.get(panelJson.source_id);
        panelJson.target_id = nodeIdMap.get(panelJson.target_id);
        newQueryGraph.edges.push({ ...typeObj, panelJson });
      }
    });
    return { question_name, query_graph: newQueryGraph };
  }

  /**
   * Make sure a question is valid
   * @param {Object} question
   * @param {String} question.question_name name of question
   * @param {Object} question.query_graph contains nodes and edges
   */
  function validateQuestion(question) {
    if (!('query_graph' in question) || question.query_graph === null) {
      return false;
    }
    if (!('nodes' in question.query_graph) || !('edges' in question.query_graph)) {
      return false;
    }
    return true;
  }

  // function openQuestionPanel(type) {
  //   newQuestionPanel.create(type);
  //   togglePanelModal(true);
  // }

  // function savePanel(type, content) {
  //   if (type === 'node') {
  //     console.log('open a new node panel');
  //     nodePanels.createNew(content);
  //   } else {
  //     console.log('open a new edge panel');
  //     edgePanels.createNew(content);
  //   }
  // }

  function isValidQuestion() {
    return validateQuestion({
      query_graph,
    });
  }

  function loadListRepresentation(input) {
    const dictRepresentation = queryGraphUtils.fromListRepresentation(input);
    updateQueryGraph(dictRepresentation);
  }

  function getListRepresentation() {
    return queryGraphUtils.toListRepresentation(query_graph);
  }

  return {
    question_name,
    query_graph,
    isValidQuestion,
    // panelState,
    // activePanelState,
    // graphState,
    // showPanelModal,
    // newQuestionPanel,
    updateQuestionName,
    makeQuestion,
    resetQuestion,
    // openQuestionPanel,
    // togglePanelModal,
    // savePanel,
    loadListRepresentation,
    getListRepresentation,
    updateQueryGraph,
  };
}
