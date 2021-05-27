import { useState, useMemo, useContext } from 'react';

import BiolinkContext from '~/context/biolink';
import kgUtils from '~/utils/knowledgeGraph';
import resultsUtils from '~/utils/results';
import stringUtils from '~/utils/strings';

/**
 * Main answer page store
 *
 * Stores current TRAPI message
 */
export default function useAnswerStore() {
  const [message, setMessage] = useState({});
  const [kgNodes, setKgNodes] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedRowId, setSelectedRowId] = useState('');
  const [metaData, setMetaData] = useState({});
  const { colorMap, hierarchies } = useContext(BiolinkContext);

  /**
   * Reset all answer explorer state
   */
  function resetAnswerExplorer() {
    setSelectedResult({});
    setSelectedRowId('');
  }

  /**
   * Initialize the answer store with a message
   *
   * Stores the message, makes the nodes for a bubble chart,
   * and resets any results table info
   * @param {object} msg - TRAPI message
   */
  function initialize(msg) {
    setMessage(msg);
    setKgNodes(kgUtils.makeDisplayNodes(msg, hierarchies));
    resetAnswerExplorer();
  }

  /**
   * Get metadata of result when selected in the results table
   * @param {object} row - result object from message that was selected
   * @param {string} rowId - the internal row id
   */
  function selectRow(row, rowId) {
    if (rowId === selectedRowId) {
      resetAnswerExplorer();
    } else {
      const edges = [];
      const edgePublications = {};
      Object.values(row.edge_bindings).forEach((value) => {
        value.forEach((kgObject) => {
          const kgEdge = message.knowledge_graph.edges[kgObject.id];
          const graphEdge = {
            id: kgObject.id,
            source: kgEdge.subject,
            target: kgEdge.object,
            predicate: kgEdge.predicate,
          };
          if (graphEdge.predicate && !Array.isArray(graphEdge.predicate)) {
            graphEdge.predicate = [graphEdge.predicate];
          }
          edges.push(graphEdge);

          const publicationsAttribute = kgEdge.attributes && Array.isArray(kgEdge.attributes) && kgEdge.attributes.find((att) => att.name === 'publications' || att.type === 'EDAM:data_0971');
          let publications = [];
          if (publicationsAttribute) {
            publications = (Array.isArray(publicationsAttribute.value) && publicationsAttribute.value) || [];
          }
          const subjectNode = message.knowledge_graph.nodes[kgEdge.subject];
          const objectNode = message.knowledge_graph.nodes[kgEdge.object];
          const edgeKey = `${subjectNode.name || kgEdge.subject} ${stringUtils.displayPredicate(graphEdge.predicate)} ${objectNode.name || kgEdge.object}`;
          edgePublications[edgeKey] = publications;
        });
      });
      const nodes = [];
      Object.values(row.node_bindings).forEach((value) => {
        value.forEach((kgObject) => {
          const kgNode = message.knowledge_graph.nodes[kgObject.id];
          let categories = kgNode.category;
          if (categories && !Array.isArray(categories)) {
            categories = [categories];
          }
          categories = kgUtils.getRankedCategories(hierarchies, categories);
          const graphNode = {
            id: kgObject.id,
            name: kgNode.name || kgObject.id || categories[0],
            category: categories[0],
          };
          nodes.push(graphNode);
        });
      });
      setSelectedResult({ nodes, edges });
      setSelectedRowId(rowId);
      setMetaData(edgePublications);
    }
  }

  /**
   * Compute table header list when message changes
   */
  const tableHeaders = useMemo(() => {
    if (message.query_graph) {
      return resultsUtils.makeTableHeaders(message, colorMap);
    }
    return [];
  }, [message]);

  return {
    initialize,
    message,

    kgNodes,

    tableHeaders,
    selectedResult,
    selectedRowId,
    selectRow,

    metaData,
  };
}
