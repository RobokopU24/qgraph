import { useState } from 'react';
import queryGraphUtils from '@/utils/queryGraph';

export default function useQuestionStore() {
  const [question_name, updateQuestionName] = useState('');
  const [query_graph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());

  function resetQuestion() {
    updateQuestionName('');
    updateQueryGraph(queryGraphUtils.getEmptyGraph());
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
    // catch any deleted nodes
    const invalidNode = Object.keys(question.query_graph.nodes).find((nodeId) => (
      question.query_graph.nodes[nodeId].deleted
    ));
    // invalidNode with either be an object or undefined
    if (invalidNode) {
      return false;
    }
    return true;
  }

  function isValidQuestion() {
    return validateQuestion({
      query_graph,
    });
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
