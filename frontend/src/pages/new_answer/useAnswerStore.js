import { useState, useMemo, useContext } from 'react';

import BiolinkContext from '~/context/biolink';
import kgUtils from './utils/kg';
import resultsUtils from './utils/results';

export default function useAnswerStore() {
  const [message, setMessage] = useState({});
  const [kgNodes, setKgNodes] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedRowId, setSelectedRowId] = useState('');
  const [metaData, setMetaData] = useState(null);
  const { colorMap, hierarchies } = useContext(BiolinkContext);

  /**
   * Reset all answer explorer state
   */
  function resetAnswerExplorer() {
    setSelectedResult({});
    setSelectedRowId('');
    setMetaData(null);
  }

  function initialize(msg) {
    setMessage(msg);
    setKgNodes(kgUtils.makeDisplayNodes(msg, hierarchies));
    resetAnswerExplorer();
  }

  function selectRow(row, rowId) {
    if (rowId === selectedRowId) {
      resetAnswerExplorer();
    } else {
      const edges = [];
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
          categories = kgUtils.removeNamedThing(categories);
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
      setMetaData(null);
    }
  }

  /**
   * Get the full metadata from knowledge graph for id
   * @param {string} kgId node or edge knowledge graph id
   * @param {string} idType type of id, either node or edge
   * @returns {object} metadata
   */
  function getMetaData(kgId, idType) {
    const { knowledge_graph } = message;
    setMetaData(knowledge_graph[idType][kgId]);
  }

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
    getMetaData,
    metaData,
  };
}
