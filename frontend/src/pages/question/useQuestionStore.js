import { useState } from 'react';
import queryGraphUtils from '~/utils/queryGraphUtils';

export default function useQuestionStore() {
  const [question_name, updateQuestionName] = useState('');
  const [query_graph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());

  function resetQuestion() {
    updateQuestionName('');
    updateQueryGraph(queryGraphUtils.getEmptyGraph());
  }

  /**
   * Make sure a question is valid
   * @param {Object} query contains nodes and edges
   */
  function validateQuestion(query) {
    if (!('nodes' in query) || !('edges' in query)) {
      return false;
    }
    // catch any deleted nodes
    const invalidNode = Object.keys(query.nodes).find((nodeId) => (
      query.nodes[nodeId].deleted
    ));
    // invalidNode with either be an object or undefined
    if (invalidNode) {
      return false;
    }
    return true;
  }

  function isValidQuestion() {
    return validateQuestion(query_graph);
  }

  return {
    question_name,
    query_graph,
    isValidQuestion,
    updateQuestionName,
    resetQuestion,
    updateQueryGraph,
  };
}
