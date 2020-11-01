import { useState } from 'react';
import queryGraphUtils from '@/utils/queryGraph';

export default function useQuestionStore() {
  // const [concepts, setConcepts] = useState([]);
  const [question_name, updateQuestionName] = useState('');
  const [query_graph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());
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
    updateQueryGraph(queryGraphUtils.getEmptyGraph());
    // updateGraphState('empty');
    // updatePanelState([]);
    // setActivePanelInd(null);
    // updateActivePanelState({});
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
    resetQuestion,
    // openQuestionPanel,
    // togglePanelModal,
    // savePanel,
    updateQueryGraph,
  };
}
